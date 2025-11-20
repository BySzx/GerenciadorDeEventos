package com.faculdade.gerenciadoreventos.controller;

import com.faculdade.gerenciadoreventos.model.Evento;
import com.faculdade.gerenciadoreventos.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @GetMapping
    public List<Evento> getAllEventos() {
        return eventoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> getEventoById(@PathVariable Long id) {
        return eventoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Evento createEvento(@Valid @RequestBody Evento evento) {
        return eventoService.save(evento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> updateEvento(@PathVariable Long id, @Valid @RequestBody Evento eventoDetalhes) {
        return eventoService.findById(id)
                .map(eventoExistente -> {
                    eventoExistente.setNome(eventoDetalhes.getNome());
                    eventoExistente.setDescricao(eventoDetalhes.getDescricao());
                    eventoExistente.setDataHora(eventoDetalhes.getDataHora());
                    eventoExistente.setCategoria(eventoDetalhes.getCategoria());
                    eventoExistente.setLocal(eventoDetalhes.getLocal());
                    Evento updatedEvento = eventoService.save(eventoExistente);
                    return ResponseEntity.ok(updatedEvento);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Long id) {
        return eventoService.findById(id)
                .map(evento -> {
                    eventoService.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}