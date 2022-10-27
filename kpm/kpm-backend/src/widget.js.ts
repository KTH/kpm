import { Response, Request } from "express";
import path from "node:path";
import fs from "fs/promises";
/**
 * Responds with the initial javascript file that holds the entire personal menu
 */
export default async function widgetJsHandler(req: Request, res: Response) {
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
    const content = await fs.readFile(
      path.resolve(__dirname, "../../kpm-frontend/distProd/index.html"),
      { encoding: "utf-8" }
    );
    console.log(content);

    res.type(".js").send(`document.write('${content}');`);
  }

  // Need to check
  res.redirect("/check");
}
