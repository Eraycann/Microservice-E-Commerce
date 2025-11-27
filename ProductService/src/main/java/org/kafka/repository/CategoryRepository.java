package org.kafka.repository;

import org.kafka.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Kategoriyi benzersiz 'slug' alanı ile bulur.
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Verilen bir slug'ın zaten kullanımda olup olmadığını kontrol eder.
     */
    boolean existsBySlug(String slug);

    /**
     * Belirli bir Parent ID'ye sahip tüm alt kategorileri bulur.
     * Hiyerarşiyi listelemek için kullanılır.
     */
    List<Category> findByParentId(Long parentId);

    /**
     * Parent ID'si NULL olan tüm ana (root) kategorileri bulur.
     */
    List<Category> findByParentIsNull();
}
