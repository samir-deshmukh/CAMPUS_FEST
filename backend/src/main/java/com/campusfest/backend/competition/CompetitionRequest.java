package com.campusfest.backend.competition;
import jakarta.validation.constraints.*;
public class CompetitionRequest {
 @NotNull private Long eventId; @NotBlank @Size(max=160) private String title; @NotBlank @Size(max=4000) private String description; private CompetitionStatus status;
 public Long getEventId(){return eventId;} public void setEventId(Long v){eventId=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public CompetitionStatus getStatus(){return status;} public void setStatus(CompetitionStatus v){status=v;}
}
