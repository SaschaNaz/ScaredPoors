EventTargetExtensions.waitEvent(document, "DOMContentLoaded")
    .then(() => {
        var subscription = EventTargetExtensions.subscribeEvent(panel, "click", () => {
            videoInput.click();
        });

        EventTargetExtensions.waitEvent(videoInput, "change").then(() => subscription.cease());
    })
    .then(() => loadVideo(videoInput.files[0]))
    .then(() => {

    });


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