import { Response, Request } from "express";
/**
 * Responds with the initial javascript file that holds the entire personal menu
 */
export default async function jsHandler(req: Request, res: Response) {
  if (!req.cookies["use_kpm"]) {
    res.send("old personal menu widget.js");
    return;
  }

  // Check "login_success = false" to avoid infinite loops
  if (req.params.login_success === "false") {
    res.send("personal menu for logged out users");
    return;
  }

  if (req.session) {
    res.send("personal menu for logged in users");
  }

  // Need to check
  res.redirect("/check");
}
