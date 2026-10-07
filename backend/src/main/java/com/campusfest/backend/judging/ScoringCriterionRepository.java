package com.campusfest.backend.judging;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ScoringCriterionRepository extends JpaRepository<ScoringCriterion,Long>{List<ScoringCriterion> findByCompetitionIdOrderBySortOrderAscIdAsc(Long competitionId);}
