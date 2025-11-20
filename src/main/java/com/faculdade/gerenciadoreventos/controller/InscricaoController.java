package com.faculdade.gerenciadoreventos.controller;

import com.faculdade.gerenciadoreventos.dto.InscricaoAdminDTO;
import com.faculdade.gerenciadoreventos.model.Inscricao;
import com.faculdade.gerenciadoreventos.model.StatusInscricao;
import com.faculdade.gerenciadoreventos.service.InscricaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscricoes")
public class InscricaoController {

    @Autowired
    private InscricaoService inscricaoService;

    @GetMapping
    public List<Inscricao> getAllInscricoes() {
        return inscricaoService.findAll();
    }

    @GetMapping("/admin")
    public ResponseEntity<List<InscricaoAdminDTO>> getIngressosAdmin() {
        List<InscricaoAdminDTO> ingressos = inscricaoService.findAllIngressosAdmin();
        return ResponseEntity.ok(ingressos);
    }

    @GetMapping("/participante/{participanteId}")
    public List<Inscricao> getInscricoesByParticipante(@PathVariable Long participanteId) {
        return inscricaoService.findByParticipante(participanteId);
    }

    @PostMapping
    public ResponseEntity<Inscricao> createInscricao(@RequestParam Long eventoId, @RequestParam Long participanteId) {
        try {
            Inscricao novaInscricao = inscricaoService.create(eventoId, participanteId);
            return ResponseEntity.ok(novaInscricao);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Inscricao> updateInscricaoStatus(@PathVariable Long id, @RequestParam StatusInscricao status) {
        return inscricaoService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInscricao(@PathVariable Long id) {
        return inscricaoService.findById(id)
                .map(inscricao -> {
                    inscricaoService.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}