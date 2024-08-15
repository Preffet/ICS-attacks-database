function showBrief(details) {
    try {
        const detailObj = JSON.parse(details);
        const overlay = document.getElementById('overlay');
        const overlayContent = document.getElementById('overlay-details');

        let reference2HTML = '';
        if (detailObj.Reference2) {
            reference2HTML = `, <a href="${detailObj.Reference2}" target="_blank"> [2]</a>`;
        }

        overlayContent.innerHTML = `
            <br>
            <h2 class="brief-title">${detailObj["Attack/Campaign Name"]}
                <div class="brief-aurora">
                    <div class="brief-aurora__item"></div>
                    <div class="brief-aurora__item"></div>
                    <div class="brief-aurora__item"></div>
                    <div class="brief-aurora__item"></div>
                </div>
            </h2>
            <br>
            <div class="brief-overview">
                <span><strong>Year:</strong> ${detailObj.Year}</span> | 
                <span><strong>Country:</strong> ${detailObj.Country}</span> | 
                <span><strong>Scale:</strong> ${detailObj.Scale}</span>
            </div>
            <div class="brief-separator"></div> <!-- Separator line -->
            <table class="brief-table">
                <tbody>
                    <tr><td><strong>Targeted Infrastructure</strong></td><td>${detailObj["Targetted Infrastructure"]}</td></tr>
                    <tr><td><strong>Initial Access</strong></td><td>${detailObj["Initial Access"]}</td></tr>
                    <tr><td><strong>Attacker Type</strong></td><td>${detailObj["Attacker Type"]}</td></tr>
                    <tr><td><strong>Attacker Name</strong></td><td>${detailObj["Attacker Name"]}</td></tr>
                    <tr><td><strong>Malware Used</strong></td><td>${detailObj["Malware"]}</td></tr>
                    <tr><td><strong>Impact</strong></td><td>${detailObj.Impact}</td></tr>
                    <tr><td><strong>Description</strong></td><td>${detailObj.Story}</td></tr>
                    <tr><td><strong>References</strong></td><td><a href="${detailObj.Reference1}" target="_blank">[1]</a>${reference2HTML}</td></tr>
                </tbody>
            </table>
        `;

        overlay.style.display = 'flex';
    } catch (error) {
        console.error("Error parsing details:", error, details);
    }
}

function applyCustomStyles() {
    $('#example').on('draw.dt', function() {
        $('tbody td').removeClass('sorting_1 sorting_2 sorting_3');
        $('tbody td').css('background-color', 'transparent');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', function (event) {
            if (link.getAttribute('href').startsWith('#') || link.getAttribute('target') === '_blank') {
                return;
            }

            event.preventDefault();
            const href = link.getAttribute('href');

            document.body.classList.add('fade-out');

            fetch(href)
                .then(response => response.text())
                .then(html => {
                    setTimeout(() => {
                        document.open();
                        document.write(html);
                        document.close();
                        document.body.classList.add('fade-in');
                    }, 200);
                });
        });
    });

    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) {
            document.body.classList.add('fade-in');
        }
    });

    function updateDataTable() {
        let selectedTypes = [];
        let selectedInfrastructures = [];
        const dataTable = $('#example').DataTable();

        $('#attacker-type-filter input[type="checkbox"]:checked').each(function () {
            selectedTypes.push('\\b' + $(this).val() + '\\b');
        });

        $('#targeted-infrastructure-filter input[type="checkbox"]:checked').each(function () {
            selectedInfrastructures.push('\\b' + $(this).val() + '\\b');
        });

        const typeSearchValue = selectedTypes.length > 0 ? selectedTypes.join('|') : 'No Matches';
        const infraSearchValue = selectedInfrastructures.length > 0 ? selectedInfrastructures.join('|') : 'No Matches';

        dataTable.columns(6).search(typeSearchValue, true, false).draw();
        dataTable.columns(1).search(infraSearchValue, true, false).draw();
    }

    function populateTable(data) {
        const tableBody = $('#example tbody');
        const attackerTypeFilter = $('#attacker-type-filter');
        const targetedInfrastructureFilter = $('#targeted-infrastructure-filter');
        const attackerTypes = new Set();

        tableBody.empty();

        data.forEach(row => {
            const attackerType = row["Attacker Type"];
            const initialAccess = row["Initial Access"];
            const targetedInfrastructure = row["Targetted Infrastructure"];
            attackerTypes.add(attackerType);

            const jsonRow = encodeURIComponent(JSON.stringify(row));
            const tableRow = `
                <tr data-attacker-type="${attackerType}" data-targeted-infrastructure="${targetedInfrastructure}" data-initial-access="${initialAccess}">
                    <td>${row["Attack/Campaign Name"]}</td>
                    <td>${targetedInfrastructure}</td>
                    <td>${row.Year}</td>
                    <td>${row.Country}</td>
                    <td>${initialAccess}</td>
                    <td style="display:none;">${row.Story}</td>
                    <td>${attackerType}</td>
                    <td><span class="brief-icon" data-details="${jsonRow}">➾</span></td>
                </tr>`;
            tableBody.append(tableRow);
        });

        attackerTypeFilter.empty();
        attackerTypes.forEach(type => {
            attackerTypeFilter.append(`
                <div>
                    <input type="checkbox" id="${type}" name="attacker-type" value="${type}" checked>
                    <label for="${type}">${type}</label>
                </div>
            `);
        });

        // Custom sorting logic for the Year column
        $.fn.dataTable.ext.type.order['custom-year-sort-pre'] = function (data) {
            const yearData = data.trim().toLowerCase();
            if (yearData === 'unknown') {
                return -Infinity; // Treat unknown as the smallest value so it sorts to the bottom in descending order
            }
            const yearParts = yearData.split('-');
            const year = parseInt(yearParts[0]);
            return isNaN(year) ? -Infinity : year;
        };

        const dataTable = $('#example').DataTable({
            dom: '<"top"lf<"info-container">>rt<"bottom"ipB><"clear">',
            paging: true,
            autoWidth: false,
            responsive: true,
            pageLength: 100,
            order: [[2, 'desc']], // Initial sorting by Year, descending from latest to oldest
            columnDefs: [
                { targets: 2, type: 'custom-year-sort' },
                { orderable: false, targets: 5 },
                { className: "dt-center", targets: "_all" },
                { width: "5%", targets: 7, orderable: false }
            ],
            buttons: [
                {
                    text: 'Download as PDF',
                    extend: 'pdfHtml5',
                    filename: 'ICS_attacks_pdf',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: ':visible:not(:last-child)',
                        search: 'applied',
                        order: 'applied'
                    },
                    customize: function (doc) {
                        doc.content.splice(0, 1);
                        const now = new Date();
                        const jsDate = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
                        doc.pageMargins = [40, 60, 40, 30];
                        doc.defaultStyle.fontSize = 7;
                        doc.styles.tableHeader.fontSize = 7;

                        doc['header'] = function(page, pages) {
                            return {
                                columns: [
                                    {
                                        alignment: 'center',
                                        text: 'ICS Attacks',
                                        fontSize: 14,
                                        bold: true
                                    }
                                ],
                                margin: [0, 20, 0, 20]
                            };
                        };

                        doc['footer'] = function(page, pages) {
                            return {
                                columns: [
                                    {
                                        alignment: 'left',
                                        text: ['Created on: ', { text: jsDate.toString() }]
                                    },
                                    {
                                        alignment: 'right',
                                        text: ['page ', { text: page.toString() }, ' of ', { text: pages.toString() }]
                                    }
                                ],
                                margin: [40, 0]
                            };
                        };

                        const objLayout = {};
                        objLayout['hLineWidth'] = function(i) { return .5; };
                        objLayout['vLineWidth'] = function(i) { return .5; };
                        objLayout['hLineColor'] = function(i) { return '#aaa'; };
                        objLayout['vLineColor'] = function(i) { return '#aaa'; };
                        objLayout['paddingLeft'] = function(i) { return 4; };
                        objLayout['paddingRight'] = function(i) { return 4; };
                        doc.content[0].layout = objLayout;

                        const tableBody = doc.content[0].table.body;
                        doc.content[0] = {
                            columns: [
                                { width: '*', text: '' },
                                {
                                    width: 'auto',
                                    table: {
                                        headerRows: 1,
                                        body: tableBody,
                                        alignment: "center"
                                    },
                                    layout: objLayout
                                },
                                { width: '*', text: '' }
                            ]
                        };
                    }
                }
            ],
            drawCallback: function (settings) {
                $('.brief-icon').off('click').on('click', function() {
                    const details = decodeURIComponent($(this).data('details'));
                    showBrief(details);
                });
                applyCustomStyles();
            },
            initComplete: function(settings, json) {
                $('.info-container').append($('.dataTables_info'));
                $('#example').show();

                $('.brief-icon').on('click', function() {
                    const details = decodeURIComponent($(this).data('details'));
                    showBrief(details);
                });

                updateDataTable();
            }
        });

        $('#attacker-type-filter input[type="checkbox"], #targeted-infrastructure-filter input[type="checkbox"]').on('change', function () {
            updateDataTable();
        });

        const yearSlider = document.getElementById('year-range-slider');
        const yearStart = document.getElementById('year-start');
        const yearEnd = document.getElementById('year-end');
        const unknownYearCheckbox = document.getElementById('unknown-year');

        // Set the unknown year checkbox to checked by default
        unknownYearCheckbox.checked = true;

        noUiSlider.create(yearSlider, {
            start: [1988, 2024],
            connect: true,
            step: 1,
            range: {
                'min': 1988,
                'max': 2024
            },
            format: {
                to: function (value) {
                    return Math.round(value);
                },
                from: function (value) {
                    return Number(value);
                }
            }
        });

        $.fn.dataTable.ext.search.push(function (settings, data) {
            const minYear = parseInt(yearSlider.noUiSlider.get()[0]);
            const maxYear = parseInt(yearSlider.noUiSlider.get()[1]);
            const yearData = data[2];

            const yearRange = yearData.split('-').map(year => year.trim());

            const isUnknownYearIncluded = unknownYearCheckbox.checked && yearData.toLowerCase() === "unknown";

            if (isUnknownYearIncluded) {
                return true;
            }

            if (yearRange.length === 2) {
                const startYear = parseInt(yearRange[0]);
                const endYear = parseInt(yearRange[1]);
                return (startYear <= maxYear && endYear >= minYear);
            } else {
                const year = parseInt(yearRange[0]);
                return (year >= minYear && year <= maxYear);
            }
        });

        yearSlider.noUiSlider.on('update', function (values) {
            yearStart.textContent = values[0];
            yearEnd.textContent = values[1];
            dataTable.draw();
        });

        yearSlider.noUiSlider.on('change', function () {
            dataTable.draw();
        });

        unknownYearCheckbox.addEventListener('change', function () {
            dataTable.draw();
        });
    }

    document.getElementById('overlay').addEventListener('click', function(event) {
        if (event.target !== this) return;
    });

    // Show the filter overlay
    document.getElementById('advanced-filter-button').addEventListener('click', function() {
        document.getElementById('filter-overlay').style.display = 'flex';
    });

    // Apply filters and hide the overlay
    document.getElementById('apply-filters-button').addEventListener('click', function() {
        updateDataTable();
        document.getElementById('filter-overlay').style.display = 'none';
    });

    // Add close functionality for overlay windows
    const overlay = document.getElementById('overlay');
    const filterOverlay = document.getElementById('filter-overlay');
    
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function() {
            overlay.style.display = 'none';
            filterOverlay.style.display = 'none';
        });
    });

    $.ajax({
        url: 'web-table.csv',
        dataType: 'text',
    }).done(function(data) {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                populateTable(results.data);
                applyCustomStyles();
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const toggleAttackerTypesButton = document.getElementById('toggle-attacker-types');
    let allAttackerTypesSelected = true;

    toggleAttackerTypesButton.addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('#attacker-type-filter input[type="checkbox"]');
        allAttackerTypesSelected = !allAttackerTypesSelected;

        checkboxes.forEach(checkbox => {
            checkbox.checked = allAttackerTypesSelected;
            $(checkbox).trigger('change');
        });

        toggleAttackerTypesButton.textContent = allAttackerTypesSelected ? 'Deselect All' : 'Select All';
        updateDataTable();
    });

    const toggleTargetedInfrastructureButton = document.getElementById('toggle-targeted-infrastructure');
    let allTargetedInfrastructureSelected = true;

    toggleTargetedInfrastructureButton.addEventListener('click', function () {
        const checkboxes = document.querySelectorAll('#targeted-infrastructure-filter input[type="checkbox"]');
        allTargetedInfrastructureSelected = !allTargetedInfrastructureSelected;

        checkboxes.forEach(checkbox => {
            checkbox.checked = allTargetedInfrastructureSelected;
            $(checkbox).trigger('change');
        });

        toggleTargetedInfrastructureButton.textContent = allTargetedInfrastructureSelected ? 'Deselect All' : 'Select All';
        updateDataTable();
    });

    const advancedFilterButton = document.getElementById('advanced-filter-button');
    let resizeTimeout;

    function positionAdvancedFilterButton() {
        const table = document.getElementById('example');
        if (!table) return;

        const tableRect = table.getBoundingClientRect();
        const buttonRect = advancedFilterButton.getBoundingClientRect();

        const buttonLeftPosition = tableRect.right - buttonRect.width - 20;

        advancedFilterButton.style.left = `${buttonLeftPosition}px`;
        advancedFilterButton.style.opacity = 1;
    }

    function throttle(func, wait) {
        let timeout;
        return function (...args) {
            if (!timeout) {
                timeout = setTimeout(() => {
                    func.apply(this, args);
                    timeout = null;
                }, wait);
            }
        };
    }

    advancedFilterButton.style.opacity = 0;
    positionAdvancedFilterButton();

    const throttledResize = throttle(positionAdvancedFilterButton, 100);

    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            cancelAnimationFrame(resizeTimeout);
        }
        resizeTimeout = requestAnimationFrame(throttledResize);
    });

    const observer = new ResizeObserver(() => {
        positionAdvancedFilterButton();
    });
    observer.observe(document.getElementById('example'));

    document.querySelector('#example').addEventListener('draw.dt', function () {
        positionAdvancedFilterButton();
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add('loaded');
});
