package stor

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Language struct {
	gorm.Model
	Code string `gorm:"size:2;index:idx_code;unique"`
}

type Publisher struct {
	gorm.Model
	Name string `gorm:"unique"`
}

type Author struct {
	gorm.Model
	Name string `gorm:"unique"`
}

type Category struct {
	gorm.Model
	Name string `gorm:"unique"`
}

type Publication struct {
	gorm.Model
	Title           string
	UUID            string `gorm:"uniqueIndex"`
	DatePublication time.Time
	Description     string
	Language        []Language  `gorm:"many2many:publication_language;"`
	Publisher       []Publisher `gorm:"many2many:publication_publisher;"`
	Author          []Author    `gorm:"many2many:publication_author;"`
	Category        []Category  `gorm:"many2many:publication_category;"`
}

// CreatePublication creates a new publication
func CreatePublication(publication *Publication) error {
	if err := db.Create(publication).Error; err != nil {
		return err
	}

	return nil
}

// GetPublicationByID retrieves a publication by ID
func GetPublicationByID(id uint) (*Publication, error) {
	var publication Publication
	if err := db.First(&publication, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Publication not found")
		}
		return nil, err
	}

	return &publication, nil
}

// UpdatePublication updates a publication
func UpdatePublication(publication *Publication) error {
	if err := db.Save(publication).Error; err != nil {
		return err
	}

	return nil
}

// DeletePublication deletes a publication
func DeletePublication(publication *Publication) error {
	if err := db.Delete(publication).Error; err != nil {
		return err
	}

	return nil
}
