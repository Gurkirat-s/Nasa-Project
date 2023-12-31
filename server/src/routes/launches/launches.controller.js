const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model');

// const { getPagination } = require('../../../services/query');
const { getPagination } = require('../../../services/query');

async function httpGetAllLaunches(req, res) {
  // console.log(req.query);
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);

  // return res.status(200).json(Array.from(launches));
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Missing required launch property!',
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  // isNaN converts checks launch.launchDate.valueOf() which is milliseconds since 1970. (Unix timestamp)
  // isNaN should return false if it is date
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await scheduleNewLaunch(launch);
  console.log(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;

  const existsLaunch = await existsLaunchWithId(launchId);

  // if launch doesn't exist
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
