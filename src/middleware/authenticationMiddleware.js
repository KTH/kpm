const got = require("got");
const { validate, parse } = require("fast-xml-parser");

async function authenticationMiddleware(req, _res, next) {
  if (!req.session.userId) {
    const baseUrl = `${process.env.SERVER_HOST_URL}/kpm`;
    const serviceValidateUrl = new URL(
      `${process.env.SSO_ROOT_URL}/serviceValidate`
    );

    if (req.query.ticket) {
      serviceValidateUrl.searchParams.set("ticket", req.query.ticket);
      serviceValidateUrl.searchParams.set("service", baseUrl);

      const { body } = await got(serviceValidateUrl);
      const parsedBody = parse(body);

      if (
        validate(body) === true &&
        !parsedBody["cas:serviceResponse"]["cas:authenticationFailure"]
      ) {
        req.session.userId =
          parsedBody["cas:serviceResponse"]["cas:authenticationSuccess"][
            "cas:user"
          ];
      }
    }
  }
  next();
}

module.exports = authenticationMiddleware;
