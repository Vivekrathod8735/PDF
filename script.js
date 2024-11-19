// Convert multiple images to a single PDF
function convertMultipleImagesToPDF() {
    const imageInput = document.getElementById('multipleImageInput');
    const files = imageInput.files;

    if (!files.length) {
        alert("Please select at least one image!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let imagePromises = [];
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        const promise = new Promise((resolve) => {
            reader.onload = function (e) {
                const imgData = e.target.result;
                if (index > 0) {
                    doc.addPage();
                }
                doc.addImage(imgData, 'JPEG', 10, 10, 180, 160);
                resolve();
            };
            reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
    });

    Promise.all(imagePromises).then(() => {
        const pdfOutput = doc.output('bloburl');
        const downloadLink = document.getElementById('multiDownloadPDF');
        downloadLink.href = pdfOutput;
        downloadLink.style.display = 'inline-block';
    });
}

// Convert PDF to JPG and PNG
function convertPDFToImage() {
    const pdfInput = document.getElementById('pdfInput');
    const file = pdfInput.files[0];

    if (!file) {
        alert("Please upload a PDF file first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const pdfData = e.target.result;
        const loadingTask = pdfjsLib.getDocument({data: pdfData});

        loadingTask.promise.then(function (pdf) {
            pdf.getPage(1).then(function (page) {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                    const imgData = canvas.toDataURL();

                    // Display the images
                    document.getElementById('outputImages').style.display = 'block';
                    document.getElementById('outputJPG').src = imgData;
                    document.getElementById('outputPNG').src = imgData;

                    // Enable download buttons
                    document.getElementById('imageOutputs').style.display = 'block';
                    document.getElementById('downloadJPG').addEventListener('click', function () {
                        downloadImage(imgData, 'image.jpg');
                    });
                    document.getElementById('downloadPNG').addEventListener('click', function () {
                        downloadImage(imgData, 'image.png');
                    });
                });
            });
        });
    };

    reader.readAsArrayBuffer(file);
}

// Function to download images as JPG or PNG
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}
