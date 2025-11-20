package com.faculdade.gerenciadoreventos.service;

import com.faculdade.gerenciadoreventos.model.*;
import com.faculdade.gerenciadoreventos.repository.EventoRepository;
import com.faculdade.gerenciadoreventos.repository.InscricaoRepository;
import com.faculdade.gerenciadoreventos.repository.ParticipanteRepository;
import com.faculdade.gerenciadoreventos.dto.InscricaoAdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InscricaoService {

    @Autowired
    private InscricaoRepository inscricaoRepository;

    @Autowired
    private ParticipanteRepository participanteRepository;

    @Autowired
    private EventoRepository eventoRepository;

    public Inscricao criarInscricao(Long eventoId, Long participanteId) {

        if (inscricaoRepository.existsByParticipanteIdAndEventoId(participanteId, eventoId)) {
            throw new IllegalArgumentException("O participante já está inscrito neste evento.");
        }
        Inscricao novaInscricao = new Inscricao();

        return inscricaoRepository.save(novaInscricao);
    }


    public List<Inscricao> findAll() {
        return inscricaoRepository.findAll();
    }

    public Optional<Inscricao> findById(Long id) {
        return inscricaoRepository.findById(id);
    }
    public List<InscricaoAdminDTO> findAllIngressosAdmin() {
        return new ArrayList<>();
    }
    public Inscricao create(Long eventoId, Long participanteId) throws RuntimeException {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        Participante participante = participanteRepository.findById(participanteId)
                .orElseThrow(() -> new RuntimeException("Participante não encontrado"));

        Inscricao novaInscricao = new Inscricao();
        novaInscricao.setEvento(evento);
        novaInscricao.setParticipante(participante);
        novaInscricao.setStatus(StatusInscricao.PENDENTE);

        return inscricaoRepository.save(novaInscricao);
    }

    public Optional<Inscricao> updateStatus(Long inscricaoId, StatusInscricao novoStatus) {
        return inscricaoRepository.findById(inscricaoId)
                .map(inscricao -> {
                    inscricao.setStatus(novoStatus);
                    return inscricaoRepository.save(inscricao);
                });
    }

    public void delete(Long id) {
        inscricaoRepository.deleteById(id);
    }

    public List<Inscricao> findByParticipante(Long participanteId) {
        return inscricaoRepository.findByParticipanteId(participanteId);
    }


}