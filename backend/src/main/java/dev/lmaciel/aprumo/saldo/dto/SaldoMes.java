package dev.lmaciel.aprumo.saldo.dto;

import java.math.BigDecimal;

/**
 * Saldo do Itaú no fim do mês. Antes do mês de início ({@code ativo = false}) o saldo é 0.00.
 */
public record SaldoMes(boolean ativo, BigDecimal saldo) {
}
