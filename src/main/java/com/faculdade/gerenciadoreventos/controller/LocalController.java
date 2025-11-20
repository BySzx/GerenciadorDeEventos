package com.faculdade.gerenciadoreventos.controller;

import com.faculdade.gerenciadoreventos.model.Local;
import com.faculdade.gerenciadoreventos.service.LocalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
public class LocalController {

    @Autowired
    private LocalService localService;

    @GetMapping
    public List<Local> getAllLocais() {
        return localService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Local> getLocalById(@PathVariable Long id) {
        return localService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Local createLocal(@RequestBody Local local) {
        return localService.save(local);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Local> updateLocal(@PathVariable Long id, @RequestBody Local localDetalhes) {
        return localService.findById(id)
                .map(localExistente -> {
                    localExistente.setNome(localDetalhes.getNome());
                    localExistente.setEndereco(localDetalhes.getEndereco());
                    localExistente.setCapacidade(localDetalhes.getCapacidade());
                    Local updatedLocal = localService.save(localExistente);
                    return ResponseEntity.ok(updatedLocal);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocal(@PathVariable Long id) {
        return localService.findById(id)
                .map(local -> {
                    localService.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}