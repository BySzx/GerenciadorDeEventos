package com.faculdade.gerenciadoreventos.controller;

import com.faculdade.gerenciadoreventos.model.Participante;
import com.faculdade.gerenciadoreventos.service.ParticipanteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
public class ParticipanteController {

    @Autowired
    private ParticipanteService participanteService;

    @GetMapping
    public List<Participante> getAllParticipantes() {
        return participanteService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Participante> getParticipanteById(@PathVariable Long id) {
        return participanteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Participante> createParticipante(@Valid @RequestBody Participante participante) {
        Participante novoParticipante = participanteService.save(participante);
        return ResponseEntity.ok(novoParticipante);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Participante> updateParticipante(@PathVariable Long id, @Valid @RequestBody Participante participanteDetalhes) {
        return participanteService.findById(id)
                .map(participante -> {
                    participante.setNome(participanteDetalhes.getNome());
                    participante.setEmail(participanteDetalhes.getEmail());
                    participante.setCpf(participanteDetalhes.getCpf());
                    participante.setTelefone(participanteDetalhes.getTelefone());
                    participante.setDataNascimento(participanteDetalhes.getDataNascimento());
                    participante.setGenero(participanteDetalhes.getGenero());

                    Participante atualizado = participanteService.save(participante);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParticipante(@PathVariable Long id) {
        return participanteService.findById(id)
                .map(participante -> {
                    participanteService.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}