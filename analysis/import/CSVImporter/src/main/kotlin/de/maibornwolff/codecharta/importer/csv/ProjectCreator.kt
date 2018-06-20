/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.csv

import com.univocity.parsers.csv.CsvParser
import com.univocity.parsers.csv.CsvParserSettings
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import java.io.InputStream
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets

class ProjectCreator(
        private val projectName: String,
        private val pathSeparator: Char,
        private val csvDelimiter: Char,
        private val metricNameTranslator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
        private val includeRows: (Array<String>) -> Boolean = { true }
) {

    fun createFromCsvStream(
            inStreams: List<InputStream>,
            projectBuilder: ProjectBuilder = ProjectBuilder(projectName)
    ): Project {
        inStreams.forEach { createFromCsvStream(it, projectBuilder) }
        return projectBuilder.build()
    }

    fun createFromCsvStream(
            inStream: InputStream,
            projectBuilder: ProjectBuilder = ProjectBuilder(projectName)
    ): ProjectBuilder {
        val parser = createParser(inStream)
        val oldHeader: Array<String?> = parser.parseNext()
        val header = CSVHeader(metricNameTranslator.translate(oldHeader))
        parseContent(projectBuilder, parser, header)
        parser.stopParsing()
        return projectBuilder
    }

    private fun parseContent(projectBuilder: ProjectBuilder, parser: CsvParser, header: CSVHeader) {
        var row = parser.parseNext()
        while (row != null) {
            if (includeRows(row)) {
                insertRowInProject(projectBuilder, row, header)
            }
            row = parser.parseNext()
        }
    }

    private fun createParser(inStream: InputStream): CsvParser {
        val parserSettings = CsvParserSettings()
        parserSettings.format.delimiter = csvDelimiter

        val parser = CsvParser(parserSettings)
        parser.beginParsing(InputStreamReader(inStream, StandardCharsets.UTF_8))
        return parser
    }

    private fun insertRowInProject(projectBuilder: ProjectBuilder, rawRow: Array<String?>, header: CSVHeader) {
        try {
            val row = CSVRow(rawRow, header, pathSeparator)
            projectBuilder.insertByPath(row.pathInTree(), row.asNode())
        } catch (e: IllegalArgumentException) {
            System.err.println(e.message)
        }
    }
}
