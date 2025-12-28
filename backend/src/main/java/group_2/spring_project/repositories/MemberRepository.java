package group_2.spring_project.repositories;


import group_2.spring_project.entities.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // ========== BASIC QUERIES ==========

    Optional<Member> findByEmployeeId(String employeeId);
    List<Member> findByWorkDomain(Member.WorkDomain workDomain);
    List<Member> findByIsActive(Boolean isActive);
    boolean existsByEmployeeId(String employeeId);

    // ========== CUSTOM QUERIES ==========

//    @Query("SELECT DISTINCT m FROM Member m " +
//            "LEFT JOIN FETCH m.shares " +
//            "LEFT JOIN FETCH m.savingAccounts " +
//            "WHERE m.id = :id")
//    Optional<Member> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT m FROM Member m WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Member> search(@Param("keyword") String keyword);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.isActive = true")
    Long countActiveMembers();

    @Query("SELECT m.workDomain, COUNT(m) FROM Member m " +
            "WHERE m.isActive = true " +
            "GROUP BY m.workDomain")
    List<Object[]> countActiveMembersByWorkDomain();

    @Query("SELECT DISTINCT m FROM Member m " +
            "LEFT JOIN FETCH m.shares " +
            "WHERE m.id = :id")
    Optional<Member> findByIdWithRelations(@Param("id") Long id);

}