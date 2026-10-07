package com.campusfest.backend.judging;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface EvaluationRepository extends JpaRepository<Evaluation,Long>{boolean existsByJudgeIdAndRegistrationId(Long judgeId,Long registrationId); List<Evaluation> findByCompetitionId(Long competitionId);}
