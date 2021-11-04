import ApiKey, { ApiKeyModel } from '../model/ApiKey';

export default class ApiRepo {
  public static async findByKey(key: string): Promise<ApiKey | null> {
    return ApiKeyModel.findOne({ key: key, status: true }).lean<ApiKey>().exec();
  }

  public static async create(model: ApiKey): Promise<ApiKey | null> {
    return await ApiKeyModel.create({ ...model, createdAt: new Date() });
  }
}
