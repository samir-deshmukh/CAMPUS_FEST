package com.campusfest.backend.competition;

import com.campusfest.backend.judging.Evaluation;
import com.campusfest.backend.judging.EvaluationRepository;
import com.campusfest.backend.registration.Registration;
import com.campusfest.backend.repository.RegistrationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class CompetitionResultService {
 private final CompetitionRepository competitions; private final EvaluationRepository evaluations; private final RegistrationRepository registrations;
 public CompetitionResultService(CompetitionRepository c, EvaluationRepository e, RegistrationRepository r){competitions=c;evaluations=e;registrations=r;}
 private Competition get(Long id){return competitions.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Competition not found"));}
 @Transactional public void publish(Long id){Competition c=get(id);if(c.getStatus()!=CompetitionStatus.CLOSED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Competition must be closed before publishing results");if(evaluations.findByCompetitionId(id).isEmpty())throw new ResponseStatusException(HttpStatus.CONFLICT,"No evaluations submitted");c.setStatus(CompetitionStatus.PUBLISHED);}
 public List<CompetitionResult> calculate(Long id){Competition c=get(id);if(c.getStatus()!=CompetitionStatus.PUBLISHED)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Results are not published");Map<Long,List<Evaluation>> grouped=new HashMap<>();for(Evaluation e:evaluations.findByCompetitionId(id))grouped.computeIfAbsent(e.getRegistration().getId(),k->new ArrayList<>()).add(e);List<CompetitionResult> out=new ArrayList<>();for(var x:grouped.entrySet()){Registration r=registrations.findById(x.getKey()).orElseThrow();double avg=x.getValue().stream().mapToInt(Evaluation::getTotalScore).average().orElse(0);out.add(new CompetitionResult(r.getId(),r.getUser().getName(),avg,x.getValue().size(),0));}out.sort(Comparator.comparingDouble(CompetitionResult::averageScore).reversed());List<CompetitionResult> ranked=new ArrayList<>();double previous=Double.NaN;int rank=0;for(int i=0;i<out.size();i++){double score=out.get(i).averageScore();if(i==0||Double.compare(score,previous)!=0)rank=i+1;ranked.add(new CompetitionResult(out.get(i).registrationId(),out.get(i).participantName(),score,out.get(i).judgeCount(),rank));previous=score;}return ranked;}
}
