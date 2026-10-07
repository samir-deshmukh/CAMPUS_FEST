package com.campusfest.backend.judging;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment,Long>{boolean existsByCompetitionIdAndJudgeId(Long c,Long j); List<JudgeAssignment> findByJudgeId(Long j); List<JudgeAssignment> findByCompetitionId(Long c); Optional<JudgeAssignment> findByCompetitionIdAndJudgeId(Long c,Long j);}
