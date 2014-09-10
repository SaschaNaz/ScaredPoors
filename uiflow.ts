EventPromise.waitEvent(document, "DOMContentLoaded")
    .then(() => {
        var subscription = EventPromise.subscribeEvent(panel, "click", () => {
            videoInput.click();
        });

        return EventPromise.waitEvent(videoInput, "change").then(subscription.cease);
    })
    .then(() => loadVideo(videoInput.files[0]))
    .then(() => VideoElementExtensions.waitMetadata(videoControl))
    .then(waitCalibration)
    .then(waitDrag)
    .then((area) => analyze(area));


function loadVideo(file: Blob) {
    if (videoControl) {
        videoControl.pause();
        if (videoControl !== <any>videoPresenter) {
            videoControl.src = "";
            document.removeChild((<any>videoPresenter).player);
            videoPresenter = null;
        }
    }

    if (!videoNativeElement.canPlayType(file.type)) {
        switch (file.type) {
            case "video/avi":
                var player = new MJPEGPlayer();
                presenter.appendChild(player.element);
                videoControl = player;
                videoPresenter = player.element;
                break;
        }
    }
    else {
        videoPresenter = videoControl = videoNativeElement;
        videoNativeElement.style.display = "";
    }

    videoControl.src = URL.createObjectURL(file);
}

function waitCalibration() {
    // TODO: create PointPresenter and calibrate sizes
}

function waitDrag() {
    openOptions.style.display = areaText.style.display = "";
    videoSlider.max = videoControl.duration.toString();
    phaseText.innerHTML =
    "Drag the screen to specify the analysis target area.\
        Then, click the bottom bar to proceed.\
        Open the options pages to adjust parameters.".replace(/\s\s+/g, "<br />");

    var dragPresenter = new DragPresenter(panel, videoPresenter, "targetArea");
    var scaleToOriginal = (area: Area) => {
        var scaleX = videoControl.videoWidth / videoPresenter.clientWidth;
        var scaleY = videoControl.videoHeight / videoPresenter.clientHeight;
        return {
            x: Math.round(area.x * scaleX),
            y: Math.round(area.y * scaleY),
            width: Math.round(area.width * scaleX),
            height: Math.round(area.height * scaleY)
        };
    };

    dragPresenter.ondragsizechanged = (area) => {
        area = scaleToOriginal(area);
        areaXText.textContent = area.x.toFixed();
        areaYText.textContent = area.y.toFixed();
        areaWidthText.textContent = area.width.toFixed();
        areaHeightText.textContent = area.height.toFixed();
    };

    return EventPromise.subscribeEvent(statusPresenter, "click", (ev, subscription) => {
        if (dragPresenter.isDragged) {
            phaseText.style.display = openOptions.style.display = areaText.style.display = "none";
            analysisText.style.display = "";
            dragPresenter.close();
            subscription.cease();
        }
    }).cessation.then(() => scaleToOriginal(dragPresenter.getTargetArea()))
}