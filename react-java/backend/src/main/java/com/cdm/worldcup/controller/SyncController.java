package com.cdm.worldcup.controller;

import com.cdm.worldcup.service.SyncScheduler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncScheduler syncScheduler;

    public SyncController(SyncScheduler syncScheduler) {
        this.syncScheduler = syncScheduler;
    }

    @GetMapping("/status")
    public SyncScheduler.SyncStatus getStatus() {
        return syncScheduler.getStatus();
    }
}
