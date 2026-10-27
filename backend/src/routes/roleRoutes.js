const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

router.get("/preconfigured", roleController.getPreconfiguredRoles);
router.get("/:address", roleController.checkAddressRoles);

module.exports = router;
