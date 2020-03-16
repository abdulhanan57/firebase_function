const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { Storage } = require("@google-cloud/storage");
const cors = require("cors")({ origin: true });
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
var qrcode = require("qrcode-generator");

// const fs = require("fs");

/**
 * Here we're using Gmail to send
 */
const storage = new Storage({
  projectId: "zyara-b2b"
});
const bucket = storage.bucket("gs://zyara-b2b.appspot.com");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hanan@shopdev.co",
    pass: "armyraw362"
  }
});
exports.sendMail = functions.https.onRequest(async (req, res) => {
  const body = JSON.parse(req.body);
  console.log(body);

  console.log(body.email);
  var no_products = "";
  var i;
  var vendors = "";
  var sku = "";
  var lang = body.customer_locale;
  if (lang === "en") {
    lang = "English";
  } else {
    lang = "Arabic";
  }
  const date = new Date(body.created_at).toDateString();
  console.log(date);
  //   res.sendStatus(200);
  //   return;
  const dest = body.email;

  if (body.line_items[0].vendor === "ZYARA B2B") {
    CreateVoucher(dest, body, date, lang, no_products, vendors, sku)
      .then(result => {
        console.log("result from sending the email: ", result);
        if (result.hasError) {
          console.log("there was an error while sending email: ", result.error);
          res.sendStatus(400);
        } else {
          res.sendStatus(200);
        }
        return;
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
        return;
      });
  } else {
    CreatePdf(dest, body, date, lang, no_products, vendors, sku)
      .then(result => {
        console.log("result from sending the email: ", result);
        if (result.hasError) {
          console.log("there was an error while sending email: ", result.error);
          res.sendStatus(400);
        } else {
          res.sendStatus(200);
        }
        return;
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
        return;
      });
  }

  // let abc = result.response;
  // console.log("after function called", result);
  //   });
});
function CreateVoucher(dest, body, date, lang, no_products, vendors, sku) {
  return new Promise(async (resolve_, reject_) => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    console.log("////////before pdf generation");
    let filepath = {};
    filepath.path = "/tmp/" + body.order_id + ".pdf";
    var pdfTemplate = "";
    let promises = [];
    let filepaths = [];
    for (let line_item_index in body.line_items) {
      let line_item = body.line_items[line_item_index];
      promises.push(
        new Promise(async (resolve, reject) => {
          pdfTemplate += `<!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office">
            
            <head>
                <title></title>
                <!--[if !mso]><!-- -->
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!--<![endif]-->
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <style type="text/css">
                    #outlook a {
                        padding: 0;
                    }
            
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
            
                    table,
                    td {
                        border-collapse: collapse;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
            
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                        -ms-interpolation-mode: bicubic;
                    }
            
                    p {
                        display: block;
                        margin: 13px 0;
                    }
            
                    label {
                        font-size: 14px;
                        color: #519850;
                        display: block;
                        margin-bottom: 3px;
                    }
            
                    input,
                    textarea {
                        width: 80%;
                        color: #606060;
                        padding: 10px;
                        margin-bottom: 8px;
                        border: 1px solid #cccccc;
                        border-radius: 8px;
                    }
            
                    .d-flex {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 1px solid #519850;
                    }
                    .d-flex  input{
                       width: 40%;
                       text-align: right;
                    }
            
                    .d-flex:last-of-type {
                        margin-top: 20px;
                        border: none;
                    }
            
                    .d-flex p {
                        font-size: 14px;
                    }
                </style>
                <!--[if mso]>
              <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              <![endif]-->
                <!--[if lte mso 11]>
              <style type="text/css">
                .mj-outlook-group-fix { width:100% !important; }
              </style>
              <![endif]-->
                <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
                <style type="text/css">
                    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                </style>
                <!--<![endif]-->
                <style type="text/css">
                    @media only screen and (min-width:480px) {
                        .mj-column-per-100 {
                            width: 100% !important;
                            max-width: 100%;
                        }
            
                        /* .mj-column-per-50 {
                            float: left;
                            width: 50% !important;
                            max-width: 50%;
                        } */
            
                        .mj-column-per-33 {
                            width: 33% !important;
                            max-width: 33%;
                        }
            
                        .mj-column-per-33-33333333333333 {
                            width: 33.33333333333333% !important;
                            max-width: 33.33333333333333%;
                        }
                    }
                </style>
                <style type="text/css">
                    @media only screen and (max-width:480px) {
                        table.mj-full-width-mobile {
                            width: 100% !important;
                        }
            
                        td.mj-full-width-mobile {
                            width: auto !important;
                        }
                    }
                    html, body {
                        height: 99%;    
                    }
                </style>
            </head>
            
            <body style="background-color:#ffffff;">
                <div style="background-color:#ffffff;">
                    <!--[if mso | IE]></v:textbox></v:rect></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#ffffff;background-color:#ffffff;width:100%;">
                            <tbody>
                                <tr>
                                    <td>
                                        <div class="mj-column-per-100 mj-outlook-group-fix"
                                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <img style="max-width: 120px; margin: 20px 0px;" src="./Zyara.png" alt="">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                                        <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                                        <div class="mj-column-per-50 mj-outlook-group-fix"
                                            style=" width:50%; float: left; font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td>
            
                                                            <div>
                                                                <label for="">Agent Name</label>
                                                                <input type="text" value="${
                                                                  body.email
                                                                }">
                                                            </div>
                                                            <div>
                                                                <label for="">Representative Name</label>
                                                                <input type="text" value="${
                                                                  body
                                                                    .billing_address
                                                                    .first_name
                                                                }">
                                                            </div>
                                                            <div>
                                                                <label for="">Representative Phone No.</label>
                                                                <input type="text" value="${
                                                                  body
                                                                    .billing_address
                                                                    .phone
                                                                }">
                                                            </div>
                                                            <div>
                                                                <label for="">Identification No.</label>
                                                                <input type="text" value="${
                                                                  body.customer_id
                                                                }">
                                                            </div>
                                                            <div>
                                                                <label for="">Order Date</label>
                                                                <input type="text" value="${date}">
                                                            </div>
                                                            <div>
                                                                <label for="">Delivery Location</label>
                                                                <textarea id="" cols="30"
                                                                    rows="5">${
                                                                      body
                                                                        .billing_address
                                                                        .address1
                                                                    }</textarea>
                                                            </div>
                                                        </td>
                                                    </tr>
            
                                                </tbody>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                                        <div class="mj-column-per-50 mj-outlook-group-fix" 
                                            style="width: 50%; float: right; font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td style="vertical-align:top;padding:0px;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                                width="100%">
                                                                <tr>
                                                                    <td>
                                                                        <div style="padding: 20px; border: 1px solid #519850;">
                                                                            <div>
                                                                                <label for="">Ticket Type</label>
                                                                                <input type="text" value="${
                                                                                  line_item.variant_title
                                                                                }">
                                                                            </div>
                                                                            <div>
                                                                                <label for="">Quantity</label>
                                                                                <input type="text" value="${
                                                                                  line_item.quantity
                                                                                }">
                                                                            </div>
                                                                            <div class="d-flex">
                                                                                <p>Price Per Unit</p>
                                                                                <p>${
                                                                                  line_item.price
                                                                                }</p>
                                                                            </div>
                                                                            <div class="d-flex">
                                                                                <p>Sub Total</p>
                                                                                <p>${
                                                                                  line_item.line_price
                                                                                }</p>
                                                                            </div>
                                                                            <div class="d-flex">
                                                                                <p>Tax Amount</p>
                                                                                <p>NULL</p>
                                                                            </div>
                                                                            <div class="d-flex">
                                                                                <p>Total Amount</p>
                                                                                <input type="text" value="${
                                                                                  line_item.line_price
                                                                                }">
                                                                            </div>
            
            
                                                                        </div>
            
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <p style=" margin-top: 20px; font-size: 16px; color:#606060;">
                                                                            Here will be some instructions. Here will be some
                                                                            instructions. Here will be some instructions. Here will
                                                                            be some instructions.
                                                                        </p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]></td></tr></table><![endif]-->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            
                </div>
                ${
                  line_item_index !== body.line_items.lenght - 1
                    ? `<p style="page-break-before: always"></p>`
                    : ""
                }
            </body>
            
            </html>`;
          resolve(filepath);
          return;
        })
      );
    }
    Promise.all(promises)
      .then(async filepaths => {
        console.log("///////filepaths");
        console.log(filepaths);
        console.log("in function");
        try {
          var page = await browser.newPage();
          console.log(pdfTemplate);
          await page.setContent(pdfTemplate);
          await page.emulateMedia("screen");
          console.log("/////after pdf generation");
          await page.pdf({
            path: filepaths[0].path,
            format: "A4",
            printBackground: true
          });
          await browser.close();
          console.log("done");
          let resp = await sendemail(body.email, filepaths);
          //process.exit();
          // res.sendStatus(200);
          // return resp;
          resolve_({
            hasError: false,
            response: resp
          });
          return;
        } catch (e) {
          console.log("error", e);
          reject_(new Error(e));

          return;
        }
      })
      .catch(err => {
        reject_(new Error(err));
        return;
      });
  });
}
function CreatePdf(dest, body, date, lang, no_products, vendors, sku) {
  return new Promise(async (resolve_, reject_) => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    console.log("////////before pdf generation");
    let filepath = {};
    filepath.path = "/tmp/" + body.order_id + ".pdf";
    var pdfTemplate = `<!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
        <title></title>
        <!--[if !mso]><!-- -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style type="text/css">
            #outlook a {
                padding: 0;
            }
            
            body {
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            
            table,
            td {
                border-collapse: collapse;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
            
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                -ms-interpolation-mode: bicubic;
            }
            
            p {
                display: block;
                margin: 13px 0;
            }
            
            label {
                font-size: 14px;
                color: #519850;
                display: block;
                margin-bottom: 3px;
            }
            
            input,
            textarea {
                width: 80%;
                color: #606060;
                padding: 10px;
                margin-bottom: 20px;
                border: 1px solid #cccccc;
            }
            
            .d-flex {
                display: flex;
                justify-content: space-between;
            }
            
            .d-flex input {
                width: 40%;
                text-align: right;
            }
            
            .d-flex p {
                font-size: 14px;
            }
        </style>
        <!--[if mso]>
      <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
        <!--[if lte mso 11]>
      <style type="text/css">
        .mj-outlook-group-fix { width:100% !important; }
      </style>
      <![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet" type="text/css">
        <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Open+Sans&display=swap);
        </style>
        <!--<![endif]-->
        <style type="text/css">
            @media only screen and (min-width:480px) {
                .mj-column-per-100 {
                    width: 100% !important;
                    max-width: 100%;
                }
                /* .mj-column-per-50 {
                    float: left;
                    width: 50% !important;
                    max-width: 50%;
                } */
                .mj-column-per-33 {
                    width: 33% !important;
                    max-width: 33%;
                }
                .mj-column-per-33-33333333333333 {
                    width: 33.33333333333333% !important;
                    max-width: 33.33333333333333%;
                }
            }
        </style>
        <style type="text/css">
            @media only screen and (max-width:480px) {
                table.mj-full-width-mobile {
                    width: 100% !important;
                }
                td.mj-full-width-mobile {
                    width: auto !important;
                }
            }
        </style>
    </head>
    
    <body style="background-color:#ffffff;">
        <div style="background-color:#ffffff;">
            <!--[if mso | IE]></v:textbox></v:rect></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
            <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:500px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
                    <tbody>
                        <tr>
                            <td>
                                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <img style="max-width: 120px; margin: 20px 0px;" src="./Zyara.png" alt="">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                                <div class="mj-column-per-50 mj-outlook-group-fix" style=" width:100%; float: left; font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tbody>
                                            <tr>
                                                <td>
    
                                                    <div>
                                                        <label for="">Billing Address</label>
                                                        <div class="d-flex">
                                                            <span style="font-size: 12px;">
                                                                ${body.billing_address.first_name}</br>
                                                                ${body.billing_address.country_code}</br>
                                                                ${body.billing_address.zip}</br>
                                                                ${body.billing_address.city}</br>
                                                                ${body.billing_address.country}</br>
                                                            </span>
                                                            <div class="d-flex " style="flex-direction: column;
                                                           justify-content: flex-end;
                                                           text-align: right;">
                                                                <p style="color: #519850; font-size: 18px; font-weight: bold;">Total Amount</p>
                                                                <input style="text-align: right;
                                                                align-self: flex-end; color: #519850; font-size: 16px; font-weight: bold;" type="text" value="${body.subtotal_price} SR">
                                                            </div>
                                                        </div>
                                                    </div>
    
                                                </td>
                                            </tr>
    
                                        </tbody>
                                    </table>
                                </div>
                                <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                                <div class="mj-column-per-50 mj-outlook-group-fix" style="width: 100%; float: right; font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tbody>
                                            <tr style="background-color: #519850;">
                                                <th style="font-size: 12px; color: #fff; padding: 10px;">Ticket Type</th>
                                                <th style="font-size: 12px; color: #fff; padding: 10px;">QTY.</th>
                                                <th style="font-size: 12px; color: #fff; padding: 10px; text-align: right;">
                                                    SubTotal</th>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #9dca9d;">
                                                <td style="font-size: 12px; padding: 10px;">
                                                    3 Days
                                                </td>
                                                <td style="font-size: 12px; padding: 10px;">
                                                    3
                                                </td>
                                                <td style="font-size: 12px; padding: 10px; text-align: right;">
                                                    40.00 SR
                                                </td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #9dca9d;">
                                                <td style="font-size: 12px; padding: 10px;">
                                                    1 Day
                                                </td>
                                                <td style="font-size: 12px; padding: 10px;">
                                                    1
                                                </td>
                                                <td style="font-size: 12px; padding: 10px; text-align: right;">
                                                    10.00 SR
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <!--[if mso | IE]></td></tr></table><![endif]-->
                                <div class="mj-column-per-50 mj-outlook-group-fix" style="width: 100%; float: right; font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tbody>
                                            <tr class="d-flex">
                                                <td>
                                                    <div style=" font-size: 14px; font-weight: 500; margin-top: 10px;">
                                                        <span style="color: #519850; font-size: 14px; font-weight: 500; margin-top: 10px;">
                                                            Payment Method</span>
                                                    </div>
                                                    <div style=" font-size: 14px; font-weight: 500; margin-top: 10px;">
                                                        <span style="color: #606060; font-size: 14px; font-weight: 500; margin-top: 10px;">
                                                            Pay via Wallet</span> --
                                                        <span style="color: #606060; font-size: 14px; font-weight: 500; margin-top: 10px; font-weight: bold;">
                                                            50.00 SR</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <table style="width: 100%;">
                                                        <tbody>
                                                            <tr>
                                                                <td style="font-size: 12px; padding-top: 10px;">
                                                                    SubTotal
                                                                </td>
                                                                <td style="font-size: 12px; text-align: right; padding-top: 10px; font-weight: bold;">
                                                                    50.00 SR
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="font-size: 12px; padding-top: 10px;">
                                                                    Shipping
                                                                </td>
                                                                <td style="font-size: 12px; text-align: right; padding-top: 10px; font-weight: bold;">
                                                                    0.00 SR
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="font-size: 12px; padding: 10px 0px;">
                                                                    Taxes
                                                                </td>
                                                                <td style="font-size: 12px; text-align: right; padding: 10px 0px; font-weight: bold;">
                                                                    0.00 SR
                                                                </td>
                                                            </tr>
                                                            <tr style="background: #519850;
                                                            color: white;">
                                                                <td style="font-size: 12px; padding: 10px;">
                                                                    Total
                                                                </td>
                                                                <td style="font-size: 12px; text-align: right; padding: 10px;">
                                                                    50.00 SR
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <!--[if mso | IE]></td></tr></table><![endif]-->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    
        </div>
    </body>
    
    </html>`;
    let promises = [];
    let filepaths = [];
    for (let line_item of body.line_items) {
      promises.push(
        new Promise(async (resolve, reject) => {
          var typeNumber = 4;
          var errorCorrectionLevel = "L";
          var qr = qrcode(typeNumber, errorCorrectionLevel);
          qr.addData(
            body.order_id +
              "," +
              line_item.title +
              "," +
              body.billing_address.first_name +
              " " +
              body.billing_address.first_name +
              "," +
              body.billing_address.phone
          );
          qr.make();
          pdfTemplate +=
            `
            <p style="page-break-before: always"></p>
            
            <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet">
            <title>Zyara</title>
        </head>
        <style>
        * {
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Lato', sans-serif;
            color: #676667;
        }
        
        .custom-container {
            width: 800px;
            margin: 0 auto;
            padding: 100px 50px;
            box-sizing: border-box;
        }
        
        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .header .logo img {
            width: 100px;
            height: 100px;
        }
        
        .header .qr-code img {
            width: 100px;
            height: 100px;
        }
        
        /* FORM */
        .form {
            display: flex;
            justify-content: space-between;
        }
        
        .form-left {
            width: 50%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .form-right {
            width: 50%;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        
        .form .item {
            margin-bottom: 20px;
            width: 80%;
        }
        
        .form .item img {
            width: 100%;
            height: 40px;
        }
        
        .form .item .sub {
            width: 40%;
            display: inline-block;
        }
        
        .form .item .sub:first-child {
            float: left;
        }
        
        .form .item .sub:last-child {
            float: right;
        }
        
        .form .item .label {
            display: block;
            color: #3e8c37;
            font-size: bold;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .form .item input, .form .item textarea {
            display: block;
            padding: 10px;
            border: 2px solid #cacbcb;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;
        }
        
        /* Info */
        .info {
            display: flex;
        }
        
        .info-section {
            width: 50%;
        }
        
        .map iframe {
            width: 100%;
            height: 100%;
        }
        
        .text {
            padding-left: 30px;
        }
        
        .text h5 {
            color: #3e8c37;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .text p:not(:last-child) {
            margin-bottom: 20px;
        }
        
        .text .text-important {
            color: #3e8c37;
            font-weight: bold;
            font-size: 18px;
        }
        
        .text .text-green {
            color: #3e8c37;
        }
        
        /* Footer */
        .footer {
            margin-top: 100px;
        }
        
        .footer h5 {
            color: #3e8c37;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .footer p:not(:last-child) {
            margin-bottom: 20px;
        }
        </style>
        <body>
            <div class="custom-container">
        
                <!-- Header -->
                <div class="header">
                    <div class="logo">
                        <img src="http://cdn.shopify.com/s/files/1/0323/7711/0587/files/logo.png?v=1584199905" alt="Zyara">
                    </div>
        
                    <div id="qr-code">
                        ` +
            qr.createImgTag() +
            `
                    </div>
                </div>
                <!-- Header -->
        
                <!-- Form -->
                <form class="form">
                    <!-- Left -->
                    <div class="form-left">
        
                        <div class="item">
                            <label class="label">Booked By</label>
                            <input type="text" value="${body.email}">
                        </div>
        
                        <div class="item">
                            <label class="label">Provided By</label>
                            <input type="text" value="${line_item.vendor}">
                        </div>
        
                        <div class="item">
                            <label class="label">Service</label>
                            <input type="text" value="${line_item.variant_title}">
                        </div>
        
                        <div class="item">
                            <label class="label">Passengers</label>
                            <textarea rows="6">${line_item.quantity}</textarea>
                        </div>
        
                        <div class="item">
                            <label class="label">Meeting Point</label>
                            <input type="text" value="${line_item.sku}">
                        </div>
        
                    </div>
                    <!-- Left -->
        
                    <!-- Right -->
                    <div class="form-right">
        
                        <div class="item">
                            <div class="sub">
                                <label class="label">Date</label>
                                <input type="text" value="${date}">
                            </div>
        
                            <div class="sub">
                                <label class="label">Time</label>
                                <input type="time">
                            </div>
                        </div>
        
                        <div class="item">
                            <label class="label">Option</label>
                            <input type="text" value="${line_item.title}">
                        </div>
        
                        <div class="item">
                            <label class="label">Languages</label>
                            <input type="text" value="${lang}">
                        </div>
        
                        <div class="item">
                            <label class="label">Reference No.</label>
                            <input type="text" value="${body.order_id}">
                        </div>
        
                        <div class="item">
                            <img id="barcode" src="http://tools.workify.xyz/api/barcode.php?text=${body.order_id}"/>
                        </div>
        
                    </div>
                    <!-- Right -->
                </form>
                <!-- Form -->
        
                <!-- Info -->
                <div class="info">
                    <div class="info-section map">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.884817416046!2d74.32308851440598!3d31.44483778139465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190453e81936df%3A0xf177526ee0796131!2sShopistan.pk!5e0!3m2!1sen!2s!4v1583578332580!5m2!1sen!2s" width="600" height="450" frameborder="0" style="border:0;" allowfullscreen=""></iframe>
                    </div>
        
                    <div class="info-section text">
                        <h5>Voucher Information</h5>
                        <p>You can hop on and off on any shop.</p>
                        <p>First stop of the tour: <span class="text-important">Al-Masjid An-Nabawi</span></p>
                        <p>The bus ticket is valid for use on the <span class="text-green">City Sightseeing Tour</span> and is valid for a period of <span>3 months</span> as of travel date, in the standard operating dates and times.</p>
                        <p>Please, check and confirm this information before booking. 48/72 hours tickets must be used on consecutive days.</p>
                    </div>
                </div>
                <!-- Info -->
        
                <!-- Footer -->
                <div class="footer">
                    <h5>Contact Us</h5>
                    <p>For more information contact our local partner Al Jawlah Tours s.shafey@jawlah-tours.com.</p>
                    <p>Or contact our customer service at +44 1789 299123 or send an email to customer@city-sightseeing.com.</p>
                </div>
                <!-- Footer -->
        
            </div>
        </body>
        <script type="text/javascript" src="qrcode.js"></script>
        </html>`;
          resolve(filepath);
          return;
        })
      );
    }
    Promise.all(promises)
      .then(async filepaths => {
        console.log("///////filepaths");
        console.log(filepaths);
        console.log("in function");
        try {
          var page = await browser.newPage();
          console.log(pdfTemplate);
          await page.setContent(pdfTemplate);
          await page.waitFor(3000);
          await page.emulateMedia("screen");
          console.log("/////after pdf generation");
          await page.pdf({
            path: filepaths[0].path,
            format: "A4",
            printBackground: true
          });
          await browser.close();
          console.log("done");
          let resp = await sendemail(body.email, filepaths);
          //process.exit();
          // res.sendStatus(200);
          // return resp;
          resolve_({
            hasError: false,
            response: resp
          });
          return;
        } catch (e) {
          console.log("error", e);
          reject_(new Error(e));

          return;
        }
      })
      .catch(err => {
        reject_(new Error(err));
        return;
      });
  });
}

async function sendemail(dest, filepaths) {
  console.log("Sent to:", dest);
  const mailOptions = {
    from: "Hanan Butt <hanan@shopdev.co>", // Something like: Jane Doe <janedoe@gmail.com>
    to: dest,
    subject: "Test subject", // email subject
    attachments: filepaths
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (erro, info) => {
      if (erro) {
        return resolve({
          hasError: true,
          error: erro.toString()
        });
        // res.send(erro.toString());
      }
      //   console.log("sent resp");
      //   return res.send("Sended");
      resolve({
        hasError: false,
        response: "success"
      });
    });
  });
}
