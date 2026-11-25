package com.ifocus.ifocus.Update;

public class UpdateManager {

    private final UpdateChecker updateChecker;
    private final UpdateDownloader updateDownloader;

    public UpdateManager() {
        this.updateChecker = new UpdateChecker();
        this.updateDownloader = new UpdateDownloader();
    }

    public void checkAndUpdate() {

        UpdateInfo update = updateChecker.checkForUpdate();

        if (update == null) {
            return;
        }

        // Download
        // Instalação
        // Reinicialização
    }
}