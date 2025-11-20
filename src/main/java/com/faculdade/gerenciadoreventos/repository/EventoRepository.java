package com.faculdade.gerenciadoreventos.repository;

import com.faculdade.gerenciadoreventos.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
}