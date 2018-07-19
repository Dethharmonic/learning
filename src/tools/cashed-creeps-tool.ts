import { CashedCreeps } from 'model/cashed-creeps.model';
import { CreepRole } from 'model/creep-role.model';

export class CashedCreepsTool {
    public static readonly cashedCreeps: CashedCreeps = new CashedCreeps();

    public static readonly requiredCount: {
        [key: string]: any;
        HARVESTER1: number,
        UPGRADER1: number,
        BUILDER1: number
    } = { HARVESTER1: 6, UPGRADER1: 2, BUILDER1: 3 };

    public static getRequirements(roleName: string): number {

        //const amount: number = CashedCreepsTool.requiredCount[roleName] ? CashedCreepsTool.requiredCount[roleName] : 0;
        //console.log('CashedCreepsTool.requiredCount[' + roleName + '] ? CashedCreepsTool.requiredCount[roleName] : 0 = ', amount);
        return CashedCreepsTool.requiredCount[roleName] ? CashedCreepsTool.requiredCount[roleName] : 0;
    }
    public static readonly supportedRoles = () => {
        const roles = [];
        for (const key in CashedCreepsTool.requiredCount) {
            const role: CreepRole = CreepRole.getRoleByName(key);
            if (role) {
                roles.push(role);
            }
        }
        return roles;
    }
}
