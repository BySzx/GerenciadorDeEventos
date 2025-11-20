package com.faculdade.gerenciadoreventos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "eventos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "A descrição é obrigatória")
    @Column(columnDefinition = "TEXT")
    private String descricao;

    @NotNull(message = "A data e hora do evento são obrigatórias")
    @FutureOrPresent(message = "A data e hora devem ser futuras ou presentes")
    @Column(nullable = false)
    private LocalDateTime dataHora;

    @ManyToOne
    @NotNull(message = "A categoria é obrigatória")
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @NotNull(message = "O local é obrigatório")
    @JoinColumn(name = "local_id", nullable = false)
    private Local local;
}