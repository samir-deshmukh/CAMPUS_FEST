package com.campusfest.backend.judging;
import com.campusfest.backend.competition.Competition; import jakarta.persistence.*;
@Entity @Table(name="scoring_criteria",indexes=@Index(name="idx_criterion_competition",columnList="competition_id"))
public class ScoringCriterion{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="competition_id",nullable=false) Competition competition;
 @Column(nullable=false,length=120) String name; @Column(length=1000) String description; @Column(nullable=false) Integer maxScore; @Column(nullable=false) Integer sortOrder=0;
 public Long getId(){return id;} public Competition getCompetition(){return competition;} public void setCompetition(Competition v){competition=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public Integer getMaxScore(){return maxScore;} public void setMaxScore(Integer v){maxScore=v;} public Integer getSortOrder(){return sortOrder;} public void setSortOrder(Integer v){sortOrder=v;}
}
