import Role, { RoleModel } from '../model/Role';

export default class RoleRepo {
  public static findByCode(code: string): Promise<Role | null> {
    return RoleModel.findOne({ code: code, status: true }).lean<Role>().exec();
  }

  public static async create(roleModel: Role): Promise<Role | null> {
    return await RoleModel.create(roleModel);
  }
}
