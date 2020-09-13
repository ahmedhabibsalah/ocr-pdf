const express = require('express');
const app = express();
//read files
const fs = require('fs'); 
//upload files
const multer = require('multer');
//read images
const {TesseractWorker} = require('tesseract.js');

//analysze images
const worker = new TesseractWorker(); 

const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename: (req,file,cb)=>{
        cb(null, file.originalname);
    }
});

const upload = multer ({storage :storage}).single('avatar');

app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.render('index');
});
app.post('/upload', (req,res)=>{
    upload(req,res,err =>{
        fs.readFile(`./uploads/${req.file.originalname}`,(err,data)=>{
            if (err) return console.log('this is your error',err);

            worker
            .recognize(data, "eng",{tessjs_create_pdf:'1'})
            .progress(progress=>{
                console.log(progress);
            })
            .then(result=>{
                res.redirect('/download');
            })
            .finally(()=> worker.terminate());
        });
    });
});

app.get('/download',(req,res)=>{
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});
// start the server
const PORT = 5000 || process.env.PORT;
app.listen(PORT,()=>console.log(`well done ${PORT}`));