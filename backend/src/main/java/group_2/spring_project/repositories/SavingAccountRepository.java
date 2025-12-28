package group_2.spring_project.repositories;


import group_2.spring_project.entities.FormalSavingAccount;
import group_2.spring_project.entities.InformalSavingAccount;
import group_2.spring_project.entities.SavingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavingAccountRepository extends JpaRepository<SavingAccount, Long> {

    // ========== BASIC DATA QUERIES ==========
    List<SavingAccount> findByMemberId(Long memberId);
    List<SavingAccount> findByMemberIdAndIsActive(Long memberId, Boolean isActive);
    Optional<SavingAccount> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    List<SavingAccount> findByIsActive(Boolean isActive);

    // ✅ FIXED COUNT QUERIES - THIS IS THE ONLY CHANGE NEEDED
    @Query("SELECT COUNT(sa) FROM SavingAccount sa " +
            "WHERE sa.member.id = :memberId AND TYPE(sa) = FormalSavingAccount AND sa.isActive = true")
    Long countFormalAccountsByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(sa) FROM SavingAccount sa " +
            "WHERE sa.member.id = :memberId AND TYPE(sa) = InformalSavingAccount AND sa.isActive = true")
    Long countInformalAccountsByMemberId(@Param("memberId") Long memberId);

    // ========== ALL OTHER QUERIES (KEEP EXISTING) ==========
    @Query("SELECT sa FROM SavingAccount sa WHERE TYPE(sa) = FormalSavingAccount")
    List<FormalSavingAccount> findAllFormalAccounts();

    @Query("SELECT sa FROM SavingAccount sa WHERE TYPE(sa) = InformalSavingAccount")
    List<InformalSavingAccount> findAllInformalAccounts();

    @Query("SELECT sa FROM SavingAccount sa WHERE sa.member.id = :memberId AND TYPE(sa) = FormalSavingAccount")
    List<FormalSavingAccount> findFormalAccountsByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT sa FROM SavingAccount sa WHERE sa.member.id = :memberId AND TYPE(sa) = InformalSavingAccount")
    List<InformalSavingAccount> findInformalAccountsByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT COALESCE(SUM(sa.currentBalance), 0) FROM SavingAccount sa WHERE sa.member.id = :memberId AND sa.isActive = true")
    Double getTotalBalanceByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT DISTINCT sa FROM SavingAccount sa LEFT JOIN FETCH sa.transactions WHERE sa.id = :id")
    Optional<SavingAccount> findByIdWithTransactions(@Param("id") Long id);

    @Query("SELECT sa FROM SavingAccount sa WHERE sa.isActive = true AND sa.currentBalance > 0 " +
            "AND sa.id IN (SELECT t.account.id FROM Transaction t GROUP BY t.account.id " +
            "HAVING MAX(t.transactionDate) < :cutoffDate)")
    List<SavingAccount> findAccountsWithLastTransactionBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
}
