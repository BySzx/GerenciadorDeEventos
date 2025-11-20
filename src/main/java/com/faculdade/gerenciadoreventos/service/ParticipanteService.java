package com.faculdade.gerenciadoreventos.service;

import com.faculdade.gerenciadoreventos.model.Participante;
import com.faculdade.gerenciadoreventos.repository.ParticipanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParticipanteService {

    @Autowired
    private ParticipanteRepository participanteRepository;

    public List<Participante> findAll() {
        return participanteRepository.findAll();
    }

    public Optional<Participante> findById(Long id) {
        return participanteRepository.findById(id);
    }

    public Participante save(Participante participante) {
        return participanteRepository.save(participante);
    }

    public void delete(Long id) {
        participanteRepository.deleteById(id);
    }
}