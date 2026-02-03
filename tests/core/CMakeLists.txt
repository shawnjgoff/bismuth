# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

add_executable(test_runner)

target_sources(test_runner PRIVATE main.cpp)

target_link_libraries(
  test_runner
  PRIVATE Qt6::Core
          Qt6::Quick
          Qt6::Qml
          Qt6::Test
          KF6::ConfigCore
          KF6::ConfigGui
          Bismuth::Core)

doctest_discover_tests(test_runner)
