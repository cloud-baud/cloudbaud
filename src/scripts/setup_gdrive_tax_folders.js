/**
 * Google Apps Script to create standard IRS subfolders across all tax year folders (2016-2026).
 * 
 * Instructions:
 * 1. Open https://script.new (or https://script.google.com)
 * 2. Paste this code into the editor.
 * 3. Click "Run" -> setupTaxFolders()
 * 4. Authorize Google Drive access when prompted.
 */

const PARENT_FOLDER_ID = '1bsHTGlWMp1j0fp_d2eDqiho1Ol0cMnzG';

const IRS_SUBFOLDERS = [
  '00_Form_1040_Main_Return',
  '01a_W2s_Form_W2_Line1a',
  '03_Schedule_C_Business_Line3',
  '03b_Schedule_C_Part_V_Other_Expenses_Line3',
  '03c_Form_8829_Home_Office_Line30',
  '05_Schedule_E_Rentals_Line5',
  '07_Schedule_D_8949_Capital_Gains_Line7',
  '08_Schedule_SE_SelfEmployment_Tax',
  '09_Forms_8959_8960_8582_8995_QBI',
  '10a_Schedule_A_1098_Primary_Mortgage_Line8a'
];

function setupTaxFolders() {
  const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const yearFolders = parentFolder.getFolders();
  
  const existingYears = {};
  while (yearFolders.hasNext()) {
    const folder = yearFolders.next();
    existingYears[folder.getName().trim()] = folder;
  }

  for (let year = 2016; year <= 2026; year++) {
    const yearStr = year.toString();
    let currentYearFolder = existingYears[yearStr];

    if (!currentYearFolder) {
      Logger.log(`Creating missing year folder: ${yearStr}`);
      currentYearFolder = parentFolder.createFolder(yearStr);
    } else {
      Logger.log(`Processing existing year folder: ${yearStr}`);
    }

    // Inspect existing subfolders in this year
    const existingSubfolders = {};
    const subIter = currentYearFolder.getFolders();
    while (subIter.hasNext()) {
      const sub = subIter.next();
      existingSubfolders[sub.getName().trim()] = sub;
    }

    // Create missing IRS subfolders
    IRS_SUBFOLDERS.forEach(subName => {
      if (!existingSubfolders[subName]) {
        Logger.log(`  + Creating subfolder: ${subName} in ${yearStr}`);
        currentYearFolder.createFolder(subName);
      } else {
        Logger.log(`  - Subfolder already exists: ${subName} in ${yearStr}`);
      }
    });
  }

  Logger.log('Finished synchronizing all 10 IRS folders across years 2016-2026.');
}
