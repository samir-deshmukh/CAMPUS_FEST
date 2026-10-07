package com.campusfest.backend.competition;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface CompetitionRepository extends JpaRepository<Competition,Long>{List<Competition> findAllByOrderByCreatedAtDesc(); List<Competition> findByStatusOrderByCreatedAtDesc(CompetitionStatus status);}
