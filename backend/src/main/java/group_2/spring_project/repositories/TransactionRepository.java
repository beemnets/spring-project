package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wldu.webservices.entities.Transaction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ========== BASIC DATA QUERIES ==========

    List<Transaction> findByAccountId(Long accountId);
    List<Transaction> findByAccountIdAndTransactionType(Long accountId, Transaction.TransactionType type);
    Optional<Transaction> findByReferenceNumber(String referenceNumber);
    boolean existsByReferenceNumber(String referenceNumber);

    // ========== DATE-BASED DATA QUERIES ==========

    // FIXED: Changed to native query
    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) FROM transactions t " +
            "WHERE t.account_id = :accountId " +
            "AND t.transaction_type = 'WITHDRAWAL' " +
            "AND DATE(t.transaction_date) = CURRENT_DATE",
            nativeQuery = true)
    Double getTodayWithdrawalTotal(@Param("accountId") Long accountId);

    // FIXED: Changed to native query
    @Query(value = "SELECT COALESCE(SUM(t.amount), 0) FROM transactions t " +
            "WHERE t.account_id = :accountId " +
            "AND t.transaction_type = 'DEPOSIT' " +
            "AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE) " +
            "AND MONTH(t.transaction_date) = MONTH(CURRENT_DATE)",
            nativeQuery = true)
    Double getThisMonthDepositTotal(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t " +
            "JOIN t.account sa " +
            "WHERE sa.member.id = :memberId " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> findByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.account.id = :accountId " +
            "ORDER BY t.transactionDate DESC " +
            "LIMIT 1")
    Optional<Transaction> findLastTransactionByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT MAX(t.transactionDate) FROM Transaction t " +
            "WHERE t.account.id = :accountId")
    Optional<LocalDateTime> findLastTransactionDateByAccountId(@Param("accountId") Long accountId);
}