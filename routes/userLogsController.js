var express = require("express");
const userLogsController = require("../controllers/userLogsController");

var router = express.Router();

router.get("/userLogList", userLogsController.userLogsList);
router.get("/:id", userLogsController.userLogsDetail);
router.post("/", userLogsController.userLogsStore);
router.put("/:id", userLogsController.userLogsUpdate);
router.delete("/:id", userLogsController.userLogsDelete);

module.exports = router;