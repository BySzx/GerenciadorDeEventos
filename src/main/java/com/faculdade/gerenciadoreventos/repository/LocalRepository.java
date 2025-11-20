package com.faculdade.gerenciadoreventos.repository;

import com.faculdade.gerenciadoreventos.model.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
}