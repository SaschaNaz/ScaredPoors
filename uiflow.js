EventTargetExtensions.waitEvent(document, "DOMContentLoaded").then(function () {
    var subscription = EventTargetExtensions.subscribeEvent(panel, "click", function () {
        videoInput.click();
    });

    EventTargetExtensions.waitEvent(videoInput, "change").then(function () {
        return subscription.cease();
    });
}).then(function () {
    return loadVideo(videoInput.files[0]);
}).then(function () {
});

function loadVideo(file) {
    if (videoControl) {
        videoControl.pause();
        if (videoControl !== videoPresenter) {
            videoControl.src = "";
            document.removeChild(videoPresenter.player);
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
    } else {
        videoPresenter = videoControl = videoNativeElement;
        videoNativeElement.style.display = "";
    }

    videoControl.src = URL.createObjectURL(file);
}
//# sourceMappingURL=uiflow.js.map
