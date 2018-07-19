import { CreepRole } from "model/creep-role.model";
import { CashedCreepsTool } from "tools/cashed-creeps-tool";

export class CashedCreeps {
    private harvesters: Creep[] = [];
    private upgraders: Creep[] = [];
    private builders: Creep[] = [];
    public getByRole(role: CreepRole): Creep[] {
        switch (role.objectClassId) {
            case CreepRole.HARVESTER1.objectClassId: {
                return this.harvesters;
            }
            case CreepRole.UPGRADER1.objectClassId: {
                return this.upgraders;
            }
            case CreepRole.BUILDER1.objectClassId: {
                return this.builders;
            }
            default: {
                return null;
            }
        }
    }
    public getTotalCreepsCount(): string {
        let msg: string = 'Total creeps count: ';
        /*CreepRole.SUPPORTEDROLE.forEach((role) => {
            msg += role.objectRoleName + ':' + this.getByRole(role).length + '; ';
        });*/
        CashedCreepsTool.supportedRoles().forEach((role) => {
            msg += role.objectRoleName + ':' + this.getByRole(role).length + '; ';
        });
        return msg;
    }
    public clearCash() {
        this.harvesters = [];
        this.upgraders = [];
        this.builders = [];
    }
    public cashCreep(creep: Creep) {
        const arrayRef: Creep[] = this.getByRole(creep.memory.role);
        if (arrayRef) {
            arrayRef.push(creep);
        }

    }

    /**
     * Getter $harvesters
     * @return {Creep[] }
     */
    public get $harvesters(): Creep[] {
        return this.harvesters;
    }


    /**
     * Getter $upgraders
     * @return {Creep[] }
     */
    public get $upgraders(): Creep[] {
        return this.upgraders;
    }


    /**
     * Getter $builders
     * @return {Creep[] }
     */
    public get $builders(): Creep[] {
        return this.builders;
    }

}
