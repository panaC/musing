package stor

import (
	"fmt"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"os"
	"testing"
	"time"
)

func TestPublicationCRUD(t *testing.T) {
	// Test CreatePublication
	publication := &Publication{
		Title:           "Test Publication",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Language: []Language{
			{Code: "en"},
			{Code: "fr"},
		},
		Publisher: []Publisher{
			{Name: "Test Publisher A"},
			{Name: "Test Publisher B"},
		},
		Author: []Author{
			{Name: "Test Author A"},
			{Name: "Test Author B"},
		},
		Category: []Category{
			{Name: "Test Category A"},
			{Name: "Test Category B"},
		},
	}

	err := CreatePublication(publication)
	if err != nil {
		t.Errorf("Error creating publication: %s", err.Error())
	}

	// Test GetPublicationByID
	fetchedPublication, err := GetPublicationByID(publication.ID)
	if err != nil {
		t.Errorf("Error getting publication by ID: %s", err.Error())
	} else {
		// Ensure fetched publication matches the created publication
		if fetchedPublication.Title != publication.Title ||
			fetchedPublication.UUID != publication.UUID ||
			!fetchedPublication.DatePublication.Equal(publication.DatePublication) ||
			fetchedPublication.Description != publication.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Test GetPublicationByTitle
	fetchedPublication, err = GetPublicationByTitle(publication.Title)
	if err != nil {
		t.Errorf("Error getting publication by title: %s", err.Error())
	} else {
		// Ensure fetched publication matches the created publication
		if fetchedPublication.ID != publication.ID ||
			fetchedPublication.UUID != publication.UUID ||
			!fetchedPublication.DatePublication.Equal(publication.DatePublication) ||
			fetchedPublication.Description != publication.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Test UpdatePublication
	fetchedPublication.Title = "Updated Test Publication"
	err = UpdatePublication(fetchedPublication)
	if err != nil {
		t.Errorf("Error updating publication: %s", err.Error())
	}

	// Fetch the updated publication again to ensure the changes were saved
	updatedPublication, err := GetPublicationByID(fetchedPublication.ID)
	if err != nil {
		t.Errorf("Error getting publication by ID: %s", err.Error())
	} else {
		if updatedPublication.Title != fetchedPublication.Title {
			t.Error("Publication title was not updated")
		}
	}

	// Test DeletePublication
	err = DeletePublication(updatedPublication)
	if err != nil {
		t.Errorf("Error deleting publication: %s", err.Error())
	}

	// Ensure the publication is no longer present in the database
	_, err = GetPublicationByID(updatedPublication.ID)
	if err == nil {
		t.Error("Publication was not deleted")
	}
}

func TestGetPublicationByCategory(t *testing.T) {
	// Create test publications
	publication1 := &Publication{
		Title:           "Test Publication 1",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Category: []Category{
			{Name: "Category A"},
		},
	}
	publication2 := &Publication{
		Title:           "Test Publication 2",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Category: []Category{
			{Name: "Category B"},
		},
	}

	err := CreatePublication(publication1)
	if err != nil {
		t.Errorf("Error creating publication 1: %s", err.Error())
	}
	err = CreatePublication(publication2)
	if err != nil {
		t.Errorf("Error creating publication 2: %s", err.Error())
	}

	// Test GetPublicationByCategory
	publications, err := GetPublicationByCategory("Category B")
	if err != nil {
		t.Errorf("Error getting publications by category: %s", err.Error())
	} else {
		// Ensure the correct number of publications is retrieved
		if len(publications) != 1 {
			t.Errorf("Expected 1 publication, got %d", len(publications))
		}

		// Ensure the retrieved publication matches the created publication
		if publications[0].Title != publication2.Title ||
			publications[0].UUID != publication2.UUID ||
			!publications[0].DatePublication.Equal(publication2.DatePublication) ||
			publications[0].Description != publication2.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Clean up the test data
	err = DeletePublication(publication1)
	if err != nil {
		t.Errorf("Error deleting publication 1: %s", err.Error())
	}
	err = DeletePublication(publication2)
	if err != nil {
		t.Errorf("Error deleting publication 2: %s", err.Error())
	}
}

func TestGetPublicationByAuthor(t *testing.T) {
	// Create test publications
	publication1 := &Publication{
		Title:           "Test Publication 1",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Author: []Author{
			{Name: "Author A"},
		},
	}
	publication2 := &Publication{
		Title:           "Test Publication 2",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Author: []Author{
			{Name: "Author B"},
		},
	}

	err := CreatePublication(publication1)
	if err != nil {
		t.Errorf("Error creating publication 1: %s", err.Error())
	}
	err = CreatePublication(publication2)
	if err != nil {
		t.Errorf("Error creating publication 2: %s", err.Error())
	}

	// Test GetPublicationByAuthor
	publications, err := GetPublicationByAuthor("Author B")
	if err != nil {
		t.Errorf("Error getting publications by author: %s", err.Error())
	} else {
		// Ensure the correct number of publications is retrieved
		if len(publications) != 1 {
			t.Errorf("Expected 1 publication, got %d", len(publications))
		}

		// Ensure the retrieved publication matches the created publication
		if publications[0].Title != publication2.Title ||
			publications[0].UUID != publication2.UUID ||
			!publications[0].DatePublication.Equal(publication2.DatePublication) ||
			publications[0].Description != publication2.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Clean up the test data
	err = DeletePublication(publication1)
	if err != nil {
		t.Errorf("Error deleting publication 1: %s", err.Error())
	}
	err = DeletePublication(publication2)
	if err != nil {
		t.Errorf("Error deleting publication 2: %s", err.Error())
	}
}

func TestCreate2PublicationsWithSameCategory(t *testing.T) {
	publication := &Publication{
		Title:           "Test Publication",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Language: []Language{
			{Code: "en"},
			{Code: "fr"},
		},
		Publisher: []Publisher{
			{Name: "Test Publisher A"},
			{Name: "Test Publisher B"},
		},
		Author: []Author{
			{Name: "Test Author A"},
			{Name: "Test Author B"},
		},
		Category: []Category{
			{Name: "Test Category A"},
			{Name: "Test Category B"},
		},
	}

	publication2 := &Publication{
		Title:           "Test Publication",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Language: []Language{
			{Code: "en"},
			{Code: "fr"},
		},
		Publisher: []Publisher{
			{Name: "Test Publisher A"},
			{Name: "Test Publisher B"},
		},
		Author: []Author{
			{Name: "Test Author A"},
			{Name: "Test Author B"},
		},
		Category: []Category{
			{Name: "Test Category A"},
			{Name: "Test Category B"},
		},
	}

	err := CreatePublication(publication)
	if err != nil {
		t.Errorf("Error creating publication: %s", err.Error())
	}

	err = CreatePublication(publication2)
	if err != nil {
		t.Errorf("Error creating publication: %s", err.Error())
	}

	categories, err2 := GetCategories()
	if err2 != nil {
		t.Errorf("Error getting categories: %s", err.Error())
	}

	// Ensure the correct number of categories is retrieved
	if len(categories) != 2 {
		t.Errorf("Expected 2 categories, got %d", len(categories))
	}

	category1 := Category{Name: "Test Category A"}
	category2 := Category{Name: "Test Category B"}

	// Ensure the retrieved categories match the created categories
	foundCategory1 := false
	foundCategory2 := false
	for _, category := range categories {
		if category.Name == category1.Name {
			foundCategory1 = true
		} else if category.Name == category2.Name {
			foundCategory2 = true
		}
	}
	if !foundCategory1 || !foundCategory2 {
		t.Error("Not all created categories were retrieved")
	}

	// Clean up the test data
	err = DeletePublication(publication)
	if err != nil {
		t.Errorf("Error deleting publication 1: %s", err.Error())
	}
	err = DeletePublication(publication2)
	if err != nil {
		t.Errorf("Error deleting publication 2: %s", err.Error())
	}

}

func TestGetPublicationByPublisher(t *testing.T) {
	// Create test publications
	publication1 := &Publication{
		Title:           "Test Publication 1",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Publisher: []Publisher{
			{Name: "Publisher A"},
		},
	}
	publication2 := &Publication{
		Title:           "Test Publication 2",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Publisher: []Publisher{
			{Name: "Publisher B"},
		},
	}

	err := CreatePublication(publication1)
	if err != nil {
		t.Errorf("Error creating publication 1: %s", err.Error())
	}
	err = CreatePublication(publication2)
	if err != nil {
		t.Errorf("Error creating publication 2: %s", err.Error())
	}

	// Test GetPublicationByPublisher
	publications, err := GetPublicationByPublisher("Publisher B")
	if err != nil {
		t.Errorf("Error getting publications by publisher: %s", err.Error())
	} else {
		// Ensure the correct number of publications is retrieved
		if len(publications) != 1 {
			t.Errorf("Expected 1 publication, got %d", len(publications))
		}

		// Ensure the retrieved publication matches the created publication
		if publications[0].Title != publication2.Title ||
			publications[0].UUID != publication2.UUID ||
			!publications[0].DatePublication.Equal(publication2.DatePublication) ||
			publications[0].Description != publication2.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Clean up the test data
	err = DeletePublication(publication1)
	if err != nil {
		t.Errorf("Error deleting publication 1: %s", err.Error())
	}
	err = DeletePublication(publication2)
	if err != nil {
		t.Errorf("Error deleting publication 2: %s", err.Error())
	}
}

func TestGetPublicationByLanguage(t *testing.T) {
	// Create test publications
	publication1 := &Publication{
		Title:           "Test Publication 1",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Language: []Language{
			{Code: "aa"},
		},
	}
	publication2 := &Publication{
		Title:           "Test Publication 2",
		UUID:            uuid.New().String(),
		DatePublication: time.Now(),
		Description:     "Test description",
		Language: []Language{
			{Code: "bb"},
		},
	}

	err := CreatePublication(publication1)
	if err != nil {
		t.Errorf("Error creating publication 1: %s", err.Error())
	}
	err = CreatePublication(publication2)
	if err != nil {
		t.Errorf("Error creating publication 2: %s", err.Error())
	}

	// Test GetPublicationByLanguage
	publications, err := GetPublicationByLanguage("bb")
	if err != nil {
		t.Errorf("Error getting publications by language: %s", err.Error())
	} else {
		// Ensure the correct number of publications is retrieved
		if len(publications) != 1 {
			t.Errorf("Expected 1 publication, got %d", len(publications))
		}

		// Ensure the retrieved publication matches the created publication
		if publications[0].Title != publication2.Title ||
			publications[0].UUID != publication2.UUID ||
			!publications[0].DatePublication.Equal(publication2.DatePublication) ||
			publications[0].Description != publication2.Description {
			t.Error("Fetched publication does not match the created publication")
		}
	}

	// Clean up the test data
	err = DeletePublication(publication1)
	if err != nil {
		t.Errorf("Error deleting publication 1: %s", err.Error())
	}
	err = DeletePublication(publication2)
	if err != nil {
		t.Errorf("Error deleting publication 2: %s", err.Error())
	}
}

func TestMain(m *testing.M) {
	// Set up the database connection
	var err error
	db, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	// Run migrations
	err = db.AutoMigrate(&Publication{}, &Language{}, &Publisher{}, &Author{}, &Category{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// Run the tests
	exitCode := m.Run()

	fmt.Println("ExitCode", exitCode)
	// Exit with the appropriate exit code
	os.Exit(exitCode)
}

func TestSuite(t *testing.T) {
	t.Run("PublicationCRUD", TestPublicationCRUD)
	t.Run("TestCreate2PublicationsWithSameCategory", TestCreate2PublicationsWithSameCategory)
	t.Run("GetPublicationByCategory", TestGetPublicationByCategory)
	t.Run("GetPublicationByLanguage", TestGetPublicationByLanguage)
	t.Run("GetPublicationByPublisher", TestGetPublicationByPublisher)
	t.Run("GetPublicationByAuthor", TestGetPublicationByAuthor)
}
