import Joi from 'joi';
import { decorators, ServiceContainer } from 'octobus.js';

const { withSchema, service } = decorators;

class CRUDServiceContainer extends ServiceContainer {
  constructor(schema, store) {
    super();
    this.schema = schema;
    this.setStore(store);
  }

  setStore(store) {
    this.store = store;
  }

  getStore() {
    return this.store;
  }

  @service()
  @withSchema(Joi.func().required())
  query(fn) {
    return fn(this.getStore());
  }

  @service()
  @withSchema(Joi.any().required())
  findById(id) {
    return this.getStore().findById(id);
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        query: Joi.object(),
        options: Joi.object()
      })
      .default({})
  )
  findOne({ query, options }) {
    return this.getStore().findOne({ query, options });
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        query: Joi.object(),
        orderBy: Joi.any(),
        limit: Joi.number(),
        skip: Joi.number(),
        fields: Joi.any()
      })
      .default({})
  )
  findMany(options) {
    return this.getStore().findMany(options);
  }

  @service()
  createOne(data) {
    return this.save(data);
  }

  @service()
  @withSchema(Joi.array().min(1).required())
  createMany(data) {
    return Promise.all(data.map(this.save.bind(this)));
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        update: Joi.object().required()
      })
      .unknown(true)
      .required()
  )
  updateOne(data) {
    return this.getStore().updateOne(data);
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        update: Joi.object().required()
      })
      .unknown(true)
      .required()
  )
  updateMany(data) {
    return this.getStore().updateMany(data);
  }

  @service()
  @withSchema(Joi.object().unknown(true).required())
  replaceOne(data) {
    return this.save(data);
  }

  async save(data) {
    return this.getStore().save(this.validate(data));
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  deleteOne(data) {
    return this.getStore().deleteOne(data);
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  deleteMany(data) {
    return this.getStore().deleteMany(data);
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  count(data) {
    return this.getStore().count(data);
  }

  validate = data => {
    if (!this.schema) {
      return data;
    }

    return Joi.attempt(data, this.schema, {
      convert: true,
      stripUnknown: true,
    });
  };
}

export default CRUDServiceContainer;
