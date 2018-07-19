import { CashedCreeps } from './model/cashed-creeps.model';

import { ErrorMapper } from 'utils/ErrorMapper';
import { CreepRole } from 'model/creep-role.model';
import { CashedCreepsTool } from 'tools/cashed-creeps-tool';

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
// declare var cashedCreeps: CashedCreeps;
export const loop = ErrorMapper.wrapLoop(() => {
  // initialize cashedCreeps
  countMyCreeps();
  // display stats board
  showStats();
  // spawners logic
  spawnersBehavior();
  // creeps AI
  creepsBehavior();
  // Automatically delete memory of missing creeps
  clearUnusedMemory();

});

export function countMyCreeps(): void {
  CashedCreepsTool.cashedCreeps.clearCash();
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.my && creep.memory.role) {
      CashedCreepsTool.cashedCreeps.cashCreep(creep);
    }
  }
}

export function clearUnusedMemory() {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
}

export function spawnersBehavior() {


  if (CashedCreepsTool.cashedCreeps.$harvesters.length < CashedCreepsTool.getRequirements(CreepRole.HARVESTER1.objectRoleName)) {
    console.log("CashedCreepsTool.cashedCreeps.$harvesters.length", CashedCreepsTool.cashedCreeps.$harvesters.length);
    spawnNewWorker(CreepRole.HARVESTER1);
  } else {
    if (CashedCreepsTool.cashedCreeps.$upgraders.length < CashedCreepsTool.getRequirements(CreepRole.UPGRADER1.objectRoleName)) {
      spawnNewWorker(CreepRole.UPGRADER1);
    } else {
      if (CashedCreepsTool.cashedCreeps.$builders.length < CashedCreepsTool.getRequirements(CreepRole.BUILDER1.objectRoleName)) {
        spawnNewWorker(CreepRole.BUILDER1);
      }
    }
  }



}
export function creepsBehavior() {
  harvesterBehavior(CashedCreepsTool.cashedCreeps.$harvesters);
  upgraderBehavior(CashedCreepsTool.cashedCreeps.$upgraders);
  builderBehavior(CashedCreepsTool.cashedCreeps.$builders);
}
export function spawnNewWorker(creepRole: CreepRole) {
  //console.log("spawnNewWorker creepRole = ", creepRole.objectRoleName);
  for (const name in Game.spawns) {
    const spawner = Game.spawns[name];
    // console.log(" if (spawner.my && !spawner.spawning) { ", spawner.my, !spawner.spawning);
    if (spawner.my && !spawner.spawning) {
      if (!spawnCreepWithRole(spawner, creepRole)) {
        //console.log(" if (!spawnCreepWithRole(spawner, CreepRole." + creepRole.objectRoleName + ")) {");
        continue;
      } else {
        //  console.log('Spawner ' + name + ' is spawning new worker - ' + CreepRole.UPGRADER1.objectRoleName);
        break;
      }
    }
  }
}
export function spawnCreepWithRole(spawner: StructureSpawn, creepRole: CreepRole): boolean {

  if (spawner.spawnCreep(creepRole.objectBodyTemplate, undefined, { dryRun: true })) {
    // console.log(" if (spawner.spawnCreep(creepRole.objectBodyTemplate, undefined, { dryRun: true })) {");
    let creepNumber: number = 0;
    const nameBody = creepRole.objectRoleName + '_';
    while (creepNumber < CashedCreepsTool.getRequirements(creepRole.objectRoleName)) {
      if (!Game.creeps[nameBody + creepNumber]) {
        break;
      } else {
        creepNumber++;
      }
    }
    let status = spawner.spawnCreep(creepRole.objectBodyTemplate, nameBody + creepNumber, {
      memory: { role: creepRole, task: CreepTask.IDLE }
    });
    // console.log("spawner.spawnCreep(creepRole.objectBodyTemplate, undefined, {memory: { role: creepRole, task: CreepTask.IDLE }}) = ", status);
    return status === OK ? true : false;
  } else {
    return false;
  }
}
export function harvesterBehavior(creeps: Creep[]) {
  if (!creeps || creeps.length === 0) {
    return;
  }
  creeps.forEach((creep) => {
    if (creep.carry.energy < creep.carryCapacity) {

      const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (target) {
        creep.memory.task = CreepTask.HARVEST;
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    } else {
      const storage = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (storage) {
        if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage);
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    }

  });
}

export function upgraderBehavior(creeps: Creep[]) {
  if (!creeps || creeps.length === 0) {
    return;
  }
  creeps.forEach((creep) => {
    if (creep.carry.energy < creep.carryCapacity && creep.memory.task !== CreepTask.UPGRADE) {
      const storage = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (storage) {
        creep.memory.task = CreepTask.GET_RESOURCES_FROM_STORAGE;
        if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage);
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    } else {
      const controller = creep.room.controller.my ? creep.room.controller : null;
      if (controller) {
        creep.memory.task = CreepTask.UPGRADE;
        switch (creep.upgradeController(controller)) {
          case ERR_NOT_IN_RANGE: {
            creep.moveTo(creep.room.controller);
            break;
          }
          case ERR_BUSY:
          case ERR_NO_BODYPART:
          case ERR_INVALID_TARGET:
          case ERR_NOT_ENOUGH_RESOURCES: {
            creep.memory.task = CreepTask.IDLE;
            break;
          }
          default: {
            break;
          }
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    }

  });
}

export function builderBehavior(creeps: Creep[]) {
  if (!creeps || creeps.length === 0) {
    return;
  }
  creeps.forEach((creep) => {
    if (creep.carry.energy < creep.carryCapacity && creep.memory.task !== CreepTask.UPGRADE) {
      const storage = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (storage) {
        creep.memory.task = CreepTask.GET_RESOURCES_FROM_STORAGE;
        if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage);
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    } else {
      const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if (target) {
        creep.memory.task = CreepTask.BUILD;
        switch (creep.build(target)) {
          case ERR_NOT_IN_RANGE: {
            creep.moveTo(creep.room.controller);
            break;
          }
          case ERR_BUSY:
          case ERR_NO_BODYPART:
          case ERR_INVALID_TARGET:
          case ERR_NOT_ENOUGH_RESOURCES: {
            creep.memory.task = CreepTask.IDLE;
            break;
          }
          default: {
            break;
          }
        }
      } else {
        creep.memory.task = CreepTask.IDLE;
      }
    }

  });
}

export function showStats() {
  console.log('===============================DASHBOARD===============================');
  console.log(`Current game tick is ${Game.time}`);
  console.log('ENERGY: ');
  for (const name in Game.spawns) {
    const amount = Game.spawns[name].energy;
    console.log(name + ' - ' + amount);
  }
  console.log(CashedCreepsTool.cashedCreeps.getTotalCreepsCount());
  console.log('=======================================================================');
}
