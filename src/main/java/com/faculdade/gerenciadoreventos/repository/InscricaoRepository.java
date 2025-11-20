package com.faculdade.gerenciadoreventos.repository;

import com.faculdade.gerenciadoreventos.model.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    List<Inscricao> findByParticipanteId(Long participanteId);
    boolean existsByParticipanteIdAndEventoId(Long participanteId, Long eventoId);

}