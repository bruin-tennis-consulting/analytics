document.getElementById("save-all-sections").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfMargin = 20;

    const sections = Array.from(document.querySelectorAll("section"));

    // Handle first section separately
    const firstCanvas = await html2canvas(sections[0], { scale: 2 });
    const firstImg = firstCanvas.toDataURL("image/png");
    const firstWidth = pageWidth - 2 * pdfMargin;
    const firstHeight = (firstCanvas.height * firstWidth) / firstCanvas.width;
    pdf.addImage(firstImg, "PNG", pdfMargin, pdfMargin, firstWidth, firstHeight);

    let yOffset = pdfMargin + firstHeight + pdfMargin;
    let i = 1;

    while (i < sections.length) {
        let canvas1 = await html2canvas(sections[i], { scale: 2 });
        let img1 = canvas1.toDataURL("image/png");
        let imgWidth1 = pageWidth - 2 * pdfMargin;

        let remainingHeight = pageHeight - yOffset - pdfMargin;

        let imgHeight1 = (canvas1.height * imgWidth1) / canvas1.width;

        let secondCanvas = null;
        let img2 = null;
        let imgWidth2, imgHeight2;

        // Check if a second section fits better
        if (i + 1 < sections.length) {
            secondCanvas = await html2canvas(sections[i + 1], { scale: 2 });
            img2 = secondCanvas.toDataURL("image/png");
            imgWidth2 = pageWidth - 2 * pdfMargin;
            imgHeight2 = (secondCanvas.height * imgWidth2) / secondCanvas.width;

            // If both fit, scale proportionally to remaining page height
            const totalHeight = imgHeight1 + pdfMargin + imgHeight2;
            if (totalHeight > remainingHeight) {
                const scale = remainingHeight / totalHeight;
                imgHeight1 *= scale;
                imgHeight2 *= scale;
            }
        } else if (imgHeight1 > remainingHeight) {
            imgHeight1 = remainingHeight; // scale down to fit page
        }

        // Add first visual
        pdf.addImage(img1, "PNG", pdfMargin, yOffset, imgWidth1, imgHeight1);
        yOffset += imgHeight1 + pdfMargin;

        // Add second visual if exists
        if (img2) {
            pdf.addImage(img2, "PNG", pdfMargin, yOffset, imgWidth2, imgHeight2);
            yOffset += imgHeight2 + pdfMargin;
            i += 2;
        } else {
            i += 1;
        }

        // Reset offset for new page if we ran out of space
        if (i < sections.length) yOffset = pdfMargin, pdf.addPage();
    }

    pdf.save("Visuals_Compilation.pdf");
});