import express from "express";
import checkAuthentication from "../middleware/check-authentication";
const router = express.Router();

router.get("/", checkAuthentication, (_request, response) => {
    response.render("root", { title: "Team GitGetDone" });
});

export default router;