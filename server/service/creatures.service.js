const axios = require("axios");
const config = require("./config");

function convertDwcToWorkers(creature) {
  if (!creature) {
    return null;
  }

  return {
    ...creature,
    animated_properties: creature.animatedProperties,
    animatedProperties: undefined,
  };
}

function convertWorkersToDwc(creature) {
  if (!creature) {
    return null;
  }

  return {
    ...creature,
    animatedProperties: creature.animated_properties,
    animated_properties: undefined,
  };
}

exports.save = async function (creature) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/creatures`,
    data: convertDwcToWorkers(creature),
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return convertWorkersToDwc(result.data.row);
};

exports.find = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data.rows.map(convertWorkersToDwc);
};

exports.findOne = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return convertWorkersToDwc(result.data.rows[0]);
  }

  return null;
};

exports.findOneByUid = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return convertWorkersToDwc(result.data.rows[0]);
  }

  return null;
};

exports.findById = async function (id) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return convertWorkersToDwc(result.data.row);
};

exports.update = async function (id, data) {
  data.user = undefined;
  data.owner = undefined;

  const result = await axios({
    method: "put",
    url: `${config.apiHost}/creatures/${id}`,
    data: data ? convertDwcToWorkers(data) : data,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return convertWorkersToDwc(result.data.row);
};
