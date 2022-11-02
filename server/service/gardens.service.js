const axios = require("axios");
const config = require("./config");

function convertDwcToWorkers(garden) {
  return {
    ...garden,
    tileProps: undefined,
    shaderProps: undefined,
    props: {
      tiles: garden.tileProps,
      shader: garden.shaderProps,
    },
  };
}

function convertWorkersToDwc(garden) {
  return {
    ...garden,
    tileProps: garden.props.tiles,
    shaderProps: garden.props.shader,
  };
}

exports.save = async function (garden) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/garden-sections`,
    data: convertDwcToWorkers(garden),
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return convertWorkersToDwc(result.data.row);
};

exports.find = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data.rows.map(convertWorkersToDwc);
};

exports.findTopPriority = async function () {};

exports.findById = async function (id) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return convertWorkersToDwc(result.data.row);
};

exports.findOne = async function ({ where }) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/all`,
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

exports.update = async function (id, data) {
  data.user = undefined;
  data.owner = undefined;

  const result = await axios({
    method: "put",
    url: `${config.apiHost}/garden-sections/${id}`,
    data: convertDwcToWorkers(data),
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data.rows;
};

exports.updateWithoutConvert = async function (id, data) {
  data.user = undefined;
  data.owner = undefined;

  const result = await axios({
    method: "put",
    url: `${config.apiHost}/garden-sections/${id}`,
    data,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data.rows;
};

exports.remove = async function (id) {
  const result = await axios({
    method: "delete",
    url: `${config.apiHost}/garden-sections/${id}`,
  });

  if (result.data.status !== 404 && result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return convertWorkersToDwc(result.data.rows[0]);
  }

  return null;
};

exports.convertWorkersToDwc = convertWorkersToDwc;
