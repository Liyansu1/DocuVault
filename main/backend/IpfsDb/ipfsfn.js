import { ipfs } from "./ipfsConnect.js";
import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import { v4 as uuid } from "uuid";
import path from "path";
import QRCode from "qrcode";

import multer from "multer";
import express from "express";

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const ipfsRouter = express.Router();

const ipfs_base_uri=process.env.IPFS_BASE_URI;
const client_base_uri=process.env.CLIENT_BASE_URI;

////////////////Setup_Start/////////////////////////////
const UPLOADS_DIR = path.join(process.cwd(), "./uploads");
const APPENDED_DIR = path.join(process.cwd(), "./appended");


if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}
if (!fs.existsSync(APPENDED_DIR)) {
    fs.mkdirSync(APPENDED_DIR);
}



const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, UPLOADS_DIR);
        },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const id = uuid();
            cb(null, id + ext);
        },
    }),
});
export {upload};
//////////////////////Setup END////////////////////////////


///////////////////IPFS_UPLOAD_FN//////////////////////////////
async function uploadFileToIPFS(filePath) {
    const file = fs.readFileSync(filePath);
    const result = await ipfs.add(file, {
        pin: true,
    });
    return result.cid.toString();
}
/////////////////////////////////////////////////////////////




////////////////////////REQUEST////////////////////////////////////////
/// uploading fn//
ipfsRouter.post('/upload', upload.single("certificate"),
    catchAsync(async (req, res) => {
        try {
            if (!req.file) {
                throw new createHttpError.BadRequest("file not found");
            }
            const id = uuid();
            const cid = await uploadFileToIPFS(req.file.path);


            res.json({
                uuid: id,
                ifpsLink: `${ipfs_base_uri}/ipfs/${cid}`, //`https://ipfs.io/ipfs/${cid}/?filename=${id}.pdf`,
                cid: cid.toString()
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while uploading the file' });
        }
    }));


//issue//
ipfsRouter.post("/issue", upload.single("certificate"),
    catchAsync(async (req, res) => {
        try {
            if (!req.file) {
                throw new createHttpError.BadRequest("file not found");
            }
            const id = req.body.selectedUUID; // Access the value of selectedIpfs here

            const appendedFilePath = path.join(APPENDED_DIR, id + ".pdf");

            await generateQRCodePDF(id, req.file.path, appendedFilePath);
            const cid = await uploadFileToIPFS(appendedFilePath);
            res.json({
                ifpsLink: `${ipfs_base_uri}/ipfs/${cid}`, //`https://ipfs.io/ipfs/${cid}/?filename=${id}.pdf`,
                cid: cid.toString(),
                uuid: id,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while uploading the file' });
        }
    }));
////////////////////////////////////////////////////////////////////////    

function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}
// generate QR Code////////////////////
async function generateQRCodePDF(text, pdfInputPath, pdfOutputPath) {
    const link = `${client_base_uri}/CompanyPage?document=${text}`;

    const qrCode = await QRCode.toDataURL(link,
        { errorCorrectionLevel: 'H' });
    const pdfBytes = fs.readFileSync(pdfInputPath); // Read the PDF file

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const [page] = pdfDoc.getPages();

    const qrCodeImage = await pdfDoc.embedPng(qrCode);
    const qrCodeDims = qrCodeImage.scale(0.25);

    page.drawImage(qrCodeImage, {
        x: page.getWidth() - qrCodeDims.width - 20,
        y: 20,
        width: qrCodeDims.width,
        height: qrCodeDims.height,
    });

    // Add text below the QR code
    page.drawText(text, {
        x: page.getWidth() - qrCodeDims.width - 200,
        y: 20 - 15,
        size: 12,
        color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    // Write the modified PDF bytes to a new file
    fs.writeFileSync(pdfOutputPath, modifiedPdfBytes);
}


export default ipfsRouter;
