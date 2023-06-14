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
}
