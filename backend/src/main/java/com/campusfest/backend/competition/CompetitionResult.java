package com.campusfest.backend.competition;

public record CompetitionResult(Long registrationId, String participantName, double averageScore, int judgeCount, int rank) {}
